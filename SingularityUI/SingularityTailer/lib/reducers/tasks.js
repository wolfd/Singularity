var ACTIONS, _, buildTask, getLastTaskUpdate, isTerminalTaskState, updateTask;

_ = require('underscore');

updateTask = function(state, taskId, updates) {
  var newState;
  newState = Object.assign({}, state);
  newState[taskId] = Object.assign({}, state[taskId], updates);
  return newState;
};

buildTask = function(taskId, offset) {
  if (offset == null) {
    offset = 0;
  }
  return {
    taskId: taskId,
    minOffset: offset,
    maxOffset: offset,
    filesize: offset,
    initialDataLoaded: false,
    logDataLoaded: false,
    terminated: false,
    exists: false
  };
};

getLastTaskUpdate = function(taskUpdates) {
  if (taskUpdates.length > 0) {
    return _.last(_.sortBy(taskUpdates, function(taskUpdate) {
      return taskUpdate.timestamp;
    })).taskState;
  } else {
    return null;
  }
};

isTerminalTaskState = function(taskState) {
  return taskState === 'TASK_FINISHED' || taskState === 'TASK_KILLED' || taskState === 'TASK_FAILED' || taskState === 'TASK_LOST' || taskState === 'TASK_ERROR';
};

ACTIONS = {
  LOG_INIT: function(state, arg) {
    var i, j, len, len1, newState, taskId, taskIdGroup, taskIdGroups;
    taskIdGroups = arg.taskIdGroups;
    newState = {};
    for (i = 0, len = taskIdGroups.length; i < len; i++) {
      taskIdGroup = taskIdGroups[i];
      for (j = 0, len1 = taskIdGroup.length; j < len1; j++) {
        taskId = taskIdGroup[j];
        newState[taskId] = buildTask(taskId);
      }
    }
    return newState;
  },
  LOG_ADD_TASK_GROUP: function(state, arg) {
    var i, len, newState, taskId, taskIds;
    taskIds = arg.taskIds;
    newState = Object.assign({}, state);
    for (i = 0, len = taskIds.length; i < len; i++) {
      taskId = taskIds[i];
      newState[taskId] = buildTask(taskId);
    }
    return newState;
  },
  LOG_REMOVE_TASK: function(state, arg) {
    var newState, taskId;
    taskId = arg.taskId;
    newState = Object.assign({}, state);
    delete newState[taskId];
    return newState;
  },
  LOG_TASK_INIT: function(state, arg) {
    var exists, offset, path, taskId;
    taskId = arg.taskId, path = arg.path, offset = arg.offset, exists = arg.exists;
    return updateTask(state, taskId, {
      path: path,
      exists: exists,
      minOffset: offset,
      maxOffset: offset,
      filesize: offset,
      initialDataLoaded: true
    });
  },
  LOG_TASK_FILE_DOES_NOT_EXIST: function(state, arg) {
    var taskId;
    taskId = arg.taskId;
    return updateTask(state, taskId, {
      exists: false,
      initialDataLoaded: true
    });
  },
  LOG_SCROLL_TO_TOP: function(state, arg) {
    var i, len, newState, taskId, taskIds;
    taskIds = arg.taskIds;
    newState = Object.assign({}, state);
    for (i = 0, len = taskIds.length; i < len; i++) {
      taskId = taskIds[i];
      newState[taskId] = Object.assign({}, state[taskId], {
        minOffset: 0,
        maxOffset: 0,
        logDataLoaded: false
      });
    }
    return newState;
  },
  LOG_SCROLL_ALL_TO_TOP: function(state) {
    var newState, taskId;
    newState = {};
    for (taskId in state) {
      newState[taskId] = Object.assign({}, state[taskId], {
        minOffset: 0,
        maxOffset: 0,
        logDataLoaded: false
      });
    }
    return newState;
  },
  LOG_SCROLL_TO_BOTTOM: function(state, arg) {
    var i, len, newState, taskId, taskIds;
    taskIds = arg.taskIds;
    newState = Object.assign({}, state);
    for (i = 0, len = taskIds.length; i < len; i++) {
      taskId = taskIds[i];
      newState[taskId] = Object.assign({}, state[taskId], {
        minOffset: state[taskId].filesize,
        maxOffset: state[taskId].filesize,
        logDataLoaded: false
      });
    }
    return newState;
  },
  LOG_SCROLL_ALL_TO_BOTTOM: function(state) {
    var newState, taskId;
    newState = {};
    for (taskId in state) {
      newState[taskId] = Object.assign({}, state[taskId], {
        minOffset: state[taskId].filesize,
        maxOffset: state[taskId].filesize,
        logDataLoaded: false
      });
    }
    return newState;
  },
  LOG_TASK_FILESIZE: function(state, arg) {
    var filesize, taskId;
    taskId = arg.taskId, filesize = arg.filesize;
    return updateTask(state, taskId, {
      filesize: filesize
    });
  },
  LOG_TASK_DATA: function(state, arg) {
    var filesize, maxOffset, minOffset, nextOffset, offset, ref, taskId;
    taskId = arg.taskId, offset = arg.offset, nextOffset = arg.nextOffset;
    ref = state[taskId], minOffset = ref.minOffset, maxOffset = ref.maxOffset, filesize = ref.filesize;
    return updateTask(state, taskId, {
      logDataLoaded: true,
      minOffset: Math.min(minOffset, offset),
      maxOffset: Math.max(maxOffset, nextOffset),
      filesize: Math.max(nextOffset, filesize)
    });
  },
  LOG_TASK_HISTORY: function(state, arg) {
    var lastTaskStatus, taskHistory, taskId;
    taskId = arg.taskId, taskHistory = arg.taskHistory;
    lastTaskStatus = getLastTaskUpdate(taskHistory.taskUpdates);
    return updateTask(state, taskId, {
      lastTaskStatus: lastTaskStatus,
      terminated: isTerminalTaskState(lastTaskStatus)
    });
  },
  LOG_REMOVE_TASK_GROUP: function(state, arg) {
    var i, len, newState, taskId, taskIds;
    taskIds = arg.taskIds;
    newState = Object.assign({}, state);
    for (i = 0, len = taskIds.length; i < len; i++) {
      taskId = taskIds[i];
      delete newState[taskId];
    }
    return newState;
  },
  LOG_EXPAND_TASK_GROUP: function(state, arg) {
    var i, len, newState, taskId, taskIds;
    taskIds = arg.taskIds;
    newState = {};
    for (i = 0, len = taskIds.length; i < len; i++) {
      taskId = taskIds[i];
      newState[taskId] = state[taskId];
    }
    return newState;
  }
};

module.exports = function(state, action) {
  if (state == null) {
    state = {};
  }
  if (action.type in ACTIONS) {
    return ACTIONS[action.type](state, action);
  } else {
    return state;
  }
};
