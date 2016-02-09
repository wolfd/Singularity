package com.hubspot.singularity.scheduler;

import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Optional;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.hubspot.mesos.JavaUtils;
import com.hubspot.singularity.SingularityDeleteResult;
import com.hubspot.singularity.SingularityMainModule;
import com.hubspot.singularity.SingularityRequestWithState;
import com.hubspot.singularity.SingularityTaskHistory;
import com.hubspot.singularity.SingularityTaskHistoryUpdate;
import com.hubspot.singularity.SingularityTaskId;
import com.hubspot.singularity.config.SingularityConfiguration;
import com.hubspot.singularity.data.RequestManager;
import com.hubspot.singularity.data.TaskManager;
import com.hubspot.singularity.data.history.HistoryManager;
import com.hubspot.singularity.sentry.SingularityExceptionNotifier;
import com.hubspot.singularity.smtp.SingularityMailer;

@Singleton
public class SingularityMailPoller extends SingularityLeaderOnlyPoller {

  private static final Logger LOG = LoggerFactory.getLogger(SingularityMailPoller.class);

  private final ScheduledExecutorService scheduledExecutorService;
  private final Map<SingularityTaskId, Future<CheckToSendTaskFinishedMailState>> taskIdToFutures;
  private final SingularityConfiguration configuration;
  private final TaskManager taskManager;
  private final RequestManager requestManager;
  private final HistoryManager historyManager;
  private final SingularityMailer mailer;
  private final SingularityExceptionNotifier exceptionNotifier;

  @Inject
  SingularityMailPoller(@Named(SingularityMainModule.NEW_TASK_THREADPOOL_NAME) ScheduledExecutorService scheduledExecutorService, SingularityConfiguration configuration,
      TaskManager taskManager, RequestManager requestManager, HistoryManager historyManager, SingularityMailer mailer, SingularityExceptionNotifier exceptionNotifier) {
    super(configuration.getCleanupEverySeconds(), TimeUnit.SECONDS);

    this.scheduledExecutorService = scheduledExecutorService;

    this.taskIdToFutures = Maps.newConcurrentMap();
    this.configuration = configuration;
    this.taskManager = taskManager;
    this.requestManager = requestManager;
    this.historyManager = historyManager;
    this.mailer = mailer;
    this.exceptionNotifier = exceptionNotifier;
  }

  @Override
  protected boolean isEnabled() {
    return configuration.getSmtpConfiguration().isPresent();
  }

  private enum CheckToSendTaskFinishedMailState {
    SENT, WAITING, ERROR;
  }

  private CheckToSendTaskFinishedMailState checkToSendTaskFinishedMail(SingularityTaskId taskId) {
    Optional<SingularityRequestWithState> requestWithState = requestManager.getRequest(taskId.getRequestId());

    if (!requestWithState.isPresent()) {
      LOG.warn("No request found for {}, can't send task finished email", taskId);
      return CheckToSendTaskFinishedMailState.ERROR;
    }

    Optional<SingularityTaskHistory> taskHistory = taskManager.getTaskHistory(taskId);

    if (!taskHistory.isPresent()) {
      taskHistory = historyManager.getTaskHistory(taskId.getId());
    }

    if (!taskHistory.isPresent()) {
      LOG.warn("No task history found for {}, can't send task finished email", taskId);
      return CheckToSendTaskFinishedMailState.ERROR;
    }

    // check to see if it's too soon.
    if (configuration.getWaitToSendTaskCompletedMailBufferMillis() > 0) {
      Optional<SingularityTaskHistoryUpdate> lastUpdate = taskHistory.get().getLastTaskUpdate();

      if (!lastUpdate.isPresent()) {
        LOG.warn("Missing last update for {}, can't send task finished email", taskId);
        return CheckToSendTaskFinishedMailState.ERROR;
      }

      final long timeSinceLastUpdate = System.currentTimeMillis() - lastUpdate.get().getTimestamp();

      if (timeSinceLastUpdate < configuration.getWaitToSendTaskCompletedMailBufferMillis()) {
        LOG.debug("Not sending task finished for {} email because last update was {} ago, buffer is {}", taskId, JavaUtils.durationFromMillis(timeSinceLastUpdate),
            JavaUtils.durationFromMillis(configuration.getWaitToSendTaskCompletedMailBufferMillis()));
        return CheckToSendTaskFinishedMailState.WAITING;
      }
    }

    try {
      mailer.sendTaskCompletedMail(taskHistory.get(), requestWithState.get().getRequest());
      return CheckToSendTaskFinishedMailState.SENT;
    } catch (Throwable t) {
      exceptionNotifier.notify(t);
      LOG.error("While trying to send task completed mail for {}", taskId, t);
      return CheckToSendTaskFinishedMailState.ERROR;
    }
  }

  private void enqueue(final SingularityTaskId taskId, long enqueueMillis) {
    final Callable<CheckToSendTaskFinishedMailState> callable = new Callable<CheckToSendTaskFinishedMailState>() {

      @Override
      public CheckToSendTaskFinishedMailState call() throws Exception {
        return checkToSendTaskFinishedMail(taskId);
      }
    };

    scheduledExecutorService.schedule(callable, enqueueMillis, TimeUnit.MILLISECONDS);
  }

  @Override
  public void runActionOnPoll() {
    for (SingularityTaskId finishedTaskId : taskManager.getTaskFinishedMailQueue()) {
      Future<CheckToSendTaskFinishedMailState> future = taskIdToFutures.get(finishedTaskId);

      if (future == null) {
        enqueue(finishedTaskId, configuration.getCheckQueuedMailsEveryMillis() + configuration.getWaitToSendTaskCompletedMailBufferMillis());
        continue;
      }

      if (!future.isDone()) {
        continue;
      }

      try {
        final CheckToSendTaskFinishedMailState mailSendState = future.get();

        switch (mailSendState) {
          case SENT:
          case ERROR:
            SingularityDeleteResult result = taskManager.deleteFinishedTaskMailQueue(finishedTaskId);
            taskIdToFutures.remove(finishedTaskId);
            LOG.debug("Task {} mail sent with status {} (queued item: {})", finishedTaskId, mailSendState, result);
            break;
          case WAITING:
            enqueue(finishedTaskId);
            break;
        }

      } catch (InterruptedException e) {
        return;
      } catch (ExecutionException e) {
        exceptionNotifier.notify(e);
        LOG.error("Unexpected execution error while sending queued mail for {}", finishedTaskId, e);
      }
    }
  }

  @Override
  protected boolean abortsOnError() {
    return false;
  }

}
