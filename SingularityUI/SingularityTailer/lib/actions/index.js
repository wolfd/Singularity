var $, Q, _, actions,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Q = require('q');

$ = require('jquery');

_ = require('underscore');

actions = function(fetchData) {
  var addTaskGroup, clickPermalink, expandTaskGroup, getTasks, init, initTask, initialize, removeTaskGroup, scrollAllToBottom, scrollAllToTop, scrollToBottom, scrollToTop, selectLogColor, setCurrentSearch, switchViewMode, taskData, taskFileDoesNotExist, taskFilesize, taskGroupBottom, taskGroupFetchNext, taskGroupFetchPrevious, taskGroupReady, taskGroupTop, taskHistory, toggleTaskLog, updateFilesizes, updateGroups;
  if (fetchData == null) {
    fetchData = null;
  }
  if (!fetchData) {
    fetchData = function(taskId, path, offset, length) {
      if (offset == null) {
        offset = void 0;
      }
      if (length == null) {
        length = 0;
      }
      length = Math.max(length, 0);
      return $.ajax({
        url: window.config.apiRoot + "/sandbox/" + taskId + "/read?" + ($.param({
          path: path,
          length: length,
          offset: offset
        }))
      });
    };
  }
  initialize = function(requestId, path, search, taskIds, apiRoot) {
    return function(dispatch, getState) {
      var groupPromises, ref, singularityApiRoot, taskIdGroups, viewMode;
      ref = getState(), viewMode = ref.viewMode, singularityApiRoot = ref.singularityApiRoot;
      if (viewMode === 'unified') {
        taskIdGroups = [taskIds];
      } else {
        taskIdGroups = taskIds.map(function(taskId) {
          return [taskId];
        });
      }
      dispatch(init(requestId, taskIdGroups, path, search));
      groupPromises = taskIdGroups.map(function(taskIds, taskGroupId) {
        var taskInitPromises;
        taskInitPromises = taskIds.map(function(taskId) {
          var resolvedPath, taskInitDeferred;
          taskInitDeferred = Q.defer();
          resolvedPath = path.replace('$TASK_ID', taskId);
          fetchData(taskId, resolvedPath).done(function(arg) {
            var offset;
            offset = arg.offset;
            dispatch(initTask(taskId, offset, resolvedPath, true));
            return taskInitDeferred.resolve();
          }).error(function(arg) {
            var status;
            status = arg.status;
            if (status === 404) {
              app.caughtError();
              dispatch(taskFileDoesNotExist(taskGroupId, taskId));
              return taskInitDeferred.resolve();
            } else {
              return taskInitDeferred.reject();
            }
          });
          return taskInitDeferred.promise;
        });
        return Promise.all(taskInitPromises).then(function() {
          return dispatch(taskGroupFetchPrevious(taskGroupId)).then(function() {
            return dispatch(taskGroupReady(taskGroupId));
          });
        });
      });
      return Promise.all(groupPromises);
    };
  };
  init = function(requestId, taskIdGroups, path, search) {
    return {
      requestId: requestId,
      taskIdGroups: taskIdGroups,
      path: path,
      search: search,
      type: 'LOG_INIT'
    };
  };
  addTaskGroup = function(taskIds, search) {
    return {
      taskIds: taskIds,
      search: search,
      type: 'LOG_ADD_TASK_GROUP'
    };
  };
  initTask = function(taskId, offset, path, exists) {
    return {
      taskId: taskId,
      offset: offset,
      path: path,
      exists: exists,
      type: 'LOG_TASK_INIT'
    };
  };
  taskFileDoesNotExist = function(taskGroupId, taskId) {
    return {
      taskId: taskId,
      taskGroupId: taskGroupId,
      type: 'LOG_TASK_FILE_DOES_NOT_EXIST'
    };
  };
  taskGroupReady = function(taskGroupId) {
    return {
      taskGroupId: taskGroupId,
      type: 'LOG_TASK_GROUP_READY'
    };
  };
  taskHistory = function(taskGroupId, taskId, taskHistory) {
    return {
      taskGroupId: taskGroupId,
      taskId: taskId,
      taskHistory: taskHistory,
      type: 'LOG_TASK_HISTORY'
    };
  };
  getTasks = function(taskGroup, tasks) {
    return taskGroup.taskIds.map(function(taskId) {
      return tasks[taskId];
    });
  };
  updateFilesizes = function() {
    return function(dispatch, getState) {
      var ref, results, singularityApiRoot, taskId, tasks;
      ref = getState(), tasks = ref.tasks, singularityApiRoot = ref.singularityApiRoot;
      results = [];
      for (taskId in tasks) {
        results.push(fetchData(taskId, tasks[taskId.path]).done(function(arg) {
          var offset;
          offset = arg.offset;
          return dispatch(taskFilesize(taskId, offset));
        }));
      }
      return results;
    };
  };
  updateGroups = function() {
    return function(dispatch, getState) {
      return getState().taskGroups.map(function(taskGroup, taskGroupId) {
        if (!taskGroup.pendingRequests) {
          if (taskGroup.top) {
            dispatch(taskGroupFetchPrevious(taskGroupId));
          }
          if (taskGroup.bottom || taskGroup.tailing) {
            return dispatch(taskGroupFetchNext(taskGroupId));
          }
        }
      });
    };
  };
  taskGroupFetchNext = function(taskGroupId) {
    return function(dispatch, getState) {
      var logRequestLength, maxLines, promises, ref, singularityApiRoot, taskGroup, taskGroups, tasks;
      ref = getState(), tasks = ref.tasks, taskGroups = ref.taskGroups, logRequestLength = ref.logRequestLength, maxLines = ref.maxLines, singularityApiRoot = ref.singularityApiRoot;
      taskGroup = taskGroups[taskGroupId];
      tasks = getTasks(taskGroup, tasks);
      if (taskGroup.pendingRequests) {
        return Promise.resolve();
      }
      dispatch({
        taskGroupId: taskGroupId,
        type: 'LOG_REQUEST_START'
      });
      promises = tasks.map(function(arg) {
        var exists, initialDataLoaded, maxOffset, path, taskId, xhr;
        taskId = arg.taskId, exists = arg.exists, maxOffset = arg.maxOffset, path = arg.path, initialDataLoaded = arg.initialDataLoaded;
        if (initialDataLoaded && exists !== false) {
          xhr = fetchData(taskId, path, maxOffset, logRequestLength);
          return xhr.done(function(arg1) {
            var data, nextOffset, offset;
            data = arg1.data, offset = arg1.offset, nextOffset = arg1.nextOffset;
            if (data.length > 0) {
              nextOffset = offset + data.length;
              return dispatch(taskData(taskGroupId, taskId, data, offset, nextOffset, true, maxLines));
            }
          });
        } else {
          return Promise.resolve();
        }
      });
      return Promise.all(promises).then(function() {
        return dispatch({
          taskGroupId: taskGroupId,
          type: 'LOG_REQUEST_END'
        });
      });
    };
  };
  taskGroupFetchPrevious = function(taskGroupId) {
    return function(dispatch, getState) {
      var logRequestLength, maxLines, promises, ref, singularityApiRoot, taskGroup, taskGroups, tasks;
      ref = getState(), tasks = ref.tasks, taskGroups = ref.taskGroups, logRequestLength = ref.logRequestLength, maxLines = ref.maxLines, singularityApiRoot = ref.singularityApiRoot;
      taskGroup = taskGroups[taskGroupId];
      tasks = getTasks(taskGroup, tasks);
      if (_.all(tasks.map(function(arg) {
        var minOffset;
        minOffset = arg.minOffset;
        return minOffset === 0;
      }))) {
        return Promise.resolve();
      }
      if (taskGroup.pendingRequests) {
        return Promise.resolve();
      }
      dispatch({
        taskGroupId: taskGroupId,
        type: 'LOG_REQUEST_START'
      });
      promises = tasks.map(function(arg) {
        var exists, initialDataLoaded, minOffset, path, taskId, xhr;
        taskId = arg.taskId, exists = arg.exists, minOffset = arg.minOffset, path = arg.path, initialDataLoaded = arg.initialDataLoaded;
        if (minOffset > 0 && initialDataLoaded && exists !== false) {
          xhr = fetchData(taskId, path, Math.max(minOffset - logRequestLength, 0), Math.min(logRequestLength, minOffset));
          return xhr.done(function(arg1) {
            var data, nextOffset, offset;
            data = arg1.data, offset = arg1.offset, nextOffset = arg1.nextOffset;
            if (data.length > 0) {
              nextOffset = offset + data.length;
              return dispatch(taskData(taskGroupId, taskId, data, offset, nextOffset, false, maxLines));
            }
          });
        } else {
          return Promise.resolve();
        }
      });
      return Promise.all(promises).then(function() {
        return dispatch({
          taskGroupId: taskGroupId,
          type: 'LOG_REQUEST_END'
        });
      });
    };
  };
  taskData = function(taskGroupId, taskId, data, offset, nextOffset, append, maxLines) {
    return {
      taskGroupId: taskGroupId,
      taskId: taskId,
      data: data,
      offset: offset,
      nextOffset: nextOffset,
      append: append,
      maxLines: maxLines,
      type: 'LOG_TASK_DATA'
    };
  };
  taskFilesize = function(taskId, filesize) {
    return {
      taskId: taskId,
      filesize: filesize,
      type: 'LOG_TASK_FILESIZE'
    };
  };
  taskGroupTop = function(taskGroupId, visible) {
    return function(dispatch, getState) {
      if (getState().taskGroups[taskGroupId].top !== visible) {
        dispatch({
          taskGroupId: taskGroupId,
          visible: visible,
          type: 'LOG_TASK_GROUP_TOP'
        });
        if (visible) {
          return dispatch(taskGroupFetchPrevious(taskGroupId));
        }
      }
    };
  };
  taskGroupBottom = function(taskGroupId, visible, tailing) {
    if (tailing == null) {
      tailing = false;
    }
    return function(dispatch, getState) {
      var ref, taskGroup, taskGroups, tasks;
      ref = getState(), taskGroups = ref.taskGroups, tasks = ref.tasks;
      taskGroup = taskGroups[taskGroupId];
      if (taskGroup.tailing !== tailing) {
        if (tailing === false || _.all(getTasks(taskGroup, tasks).map(function(arg) {
          var filesize, maxOffset;
          maxOffset = arg.maxOffset, filesize = arg.filesize;
          return maxOffset >= filesize;
        }))) {
          dispatch({
            taskGroupId: taskGroupId,
            tailing: tailing,
            type: 'LOG_TASK_GROUP_TAILING'
          });
        }
      }
      if (taskGroup.bottom !== visible) {
        dispatch({
          taskGroupId: taskGroupId,
          visible: visible,
          type: 'LOG_TASK_GROUP_BOTTOM'
        });
        if (visible) {
          return dispatch(taskGroupFetchNext(taskGroupId));
        }
      }
    };
  };
  clickPermalink = function(offset) {
    return {
      offset: offset,
      type: 'LOG_CLICK_OFFSET_LINK'
    };
  };
  selectLogColor = function(color) {
    return {
      color: color,
      type: 'LOG_SELECT_COLOR'
    };
  };
  switchViewMode = function(newViewMode) {
    return function(dispatch, getState) {
      var activeRequest, path, ref, search, taskGroups, taskIds, viewMode;
      ref = getState(), taskGroups = ref.taskGroups, path = ref.path, activeRequest = ref.activeRequest, search = ref.search, viewMode = ref.viewMode;
      if (newViewMode === 'custom' || newViewMode === viewMode) {
        return;
      }
      taskIds = _.flatten(_.pluck(taskGroups, 'taskIds'));
      dispatch({
        viewMode: newViewMode,
        type: 'LOG_SWITCH_VIEW_MODE'
      });
      return dispatch(initialize(activeRequest.requestId, path, search, taskIds));
    };
  };
  setCurrentSearch = function(newSearch) {
    return function(dispatch, getState) {
      var activeRequest, currentSearch, path, ref, taskGroups;
      ref = getState(), activeRequest = ref.activeRequest, path = ref.path, taskGroups = ref.taskGroups, currentSearch = ref.currentSearch;
      if (newSearch !== currentSearch) {
        return dispatch(initialize(activeRequest.requestId, path, newSearch, _.flatten(_.pluck(taskGroups, 'taskIds'))));
      }
    };
  };
  toggleTaskLog = function(taskId) {
    return function(dispatch, getState) {
      var path, ref, resolvedPath, search, singularityApiRoot, tasks, viewMode;
      ref = getState(), search = ref.search, path = ref.path, tasks = ref.tasks, viewMode = ref.viewMode, singularityApiRoot = ref.singularityApiRoot;
      if (taskId in tasks) {
        if (Object.keys(tasks).length > 1) {
          return dispatch({
            taskId: taskId,
            type: 'LOG_REMOVE_TASK'
          });
        } else {

        }
      } else {
        if (viewMode === 'split') {
          dispatch(addTaskGroup([taskId], search));
        }
        resolvedPath = path.replace('$TASK_ID', taskId);
        return fetchData(taskId, resolvedPath).done(function(arg) {
          var offset;
          offset = arg.offset;
          dispatch(initTask(taskId, offset, resolvedPath, true));
          return getState().taskGroups.map(function(taskGroup, taskGroupId) {
            if (indexOf.call(taskGroup.taskIds, taskId) >= 0) {
              return dispatch(taskGroupFetchPrevious(taskGroupId)).then(function() {
                return dispatch(taskGroupReady(taskGroupId));
              });
            }
          });
        });
      }
    };
  };
  removeTaskGroup = function(taskGroupId) {
    return function(dispatch, getState) {
      var taskIds;
      taskIds = getState().taskGroups[taskGroupId].taskIds;
      return dispatch({
        taskGroupId: taskGroupId,
        taskIds: taskIds,
        type: 'LOG_REMOVE_TASK_GROUP'
      });
    };
  };
  expandTaskGroup = function(taskGroupId) {
    return function(dispatch, getState) {
      var taskIds;
      taskIds = getState().taskGroups[taskGroupId].taskIds;
      return dispatch({
        taskGroupId: taskGroupId,
        taskIds: taskIds,
        type: 'LOG_EXPAND_TASK_GROUP'
      });
    };
  };
  scrollToTop = function(taskGroupId) {
    return function(dispatch, getState) {
      var taskIds;
      taskIds = getState().taskGroups[taskGroupId].taskIds;
      dispatch({
        taskGroupId: taskGroupId,
        taskIds: taskIds,
        type: 'LOG_SCROLL_TO_TOP'
      });
      return dispatch(taskGroupFetchNext(taskGroupId));
    };
  };
  scrollAllToTop = function() {
    return function(dispatch, getState) {
      dispatch({
        type: 'LOG_SCROLL_ALL_TO_TOP'
      });
      return getState().taskGroups.map(function(taskGroup, taskGroupId) {
        return dispatch(taskGroupFetchNext(taskGroupId));
      });
    };
  };
  scrollToBottom = function(taskGroupId) {
    return function(dispatch, getState) {
      var taskIds;
      taskIds = getState().taskGroups[taskGroupId].taskIds;
      dispatch({
        taskGroupId: taskGroupId,
        taskIds: taskIds,
        type: 'LOG_SCROLL_TO_BOTTOM'
      });
      return dispatch(taskGroupFetchPrevious(taskGroupId));
    };
  };
  scrollAllToBottom = function() {
    return function(dispatch, getState) {
      dispatch({
        type: 'LOG_SCROLL_ALL_TO_BOTTOM'
      });
      return getState().taskGroups.map(function(taskGroup, taskGroupId) {
        return dispatch(taskGroupFetchPrevious(taskGroupId));
      });
    };
  };
  return {
    initialize: initialize,
    taskGroupFetchNext: taskGroupFetchNext,
    taskGroupFetchPrevious: taskGroupFetchPrevious,
    clickPermalink: clickPermalink,
    updateGroups: updateGroups,
    updateFilesizes: updateFilesizes,
    taskGroupTop: taskGroupTop,
    taskGroupBottom: taskGroupBottom,
    selectLogColor: selectLogColor,
    switchViewMode: switchViewMode,
    setCurrentSearch: setCurrentSearch,
    toggleTaskLog: toggleTaskLog,
    scrollToTop: scrollToTop,
    scrollAllToTop: scrollAllToTop,
    scrollToBottom: scrollToBottom,
    scrollAllToBottom: scrollAllToBottom,
    removeTaskGroup: removeTaskGroup,
    expandTaskGroup: expandTaskGroup
  };
};

module.exports = actions;
