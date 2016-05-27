var ACTIONS, TIMESTAMP_REGEX, _, buildEmptyBuffer, buildTaskGroup, combineReducers, filterLogLines, moment, parseLineTimestamp, resetTaskGroup, updateTaskGroup,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

combineReducers = require('redux').combineReducers;

moment = require('moment');

_ = require('underscore');

({
  getTaskDataFromTaskId: function(taskId) {
    var splits;
    splits = taskId.split('-');
    return {
      id: taskId,
      rackId: splits[splits.length - 1],
      host: splits[splits.length - 2],
      instanceNo: splits[splits.length - 3],
      startedAt: splits[splits.length - 4],
      deployId: splits[splits.length - 5],
      requestId: splits.slice(0, +(splits.length - 6) + 1 || 9e9).join('-')
    };
  }
});

buildTaskGroup = function(taskIds, search) {
  return {
    taskIds: taskIds,
    search: search,
    logLines: [],
    taskBuffer: {},
    prependedLineCount: 0,
    linesRemovedFromTop: 0,
    updatedAt: +new Date(),
    top: false,
    bottom: false,
    tailing: false,
    ready: false,
    pendingRequests: false,
    detectedTimestamp: false
  };
};

resetTaskGroup = function(tailing) {
  if (tailing == null) {
    tailing = false;
  }
  return {
    logLines: [],
    taskBuffer: {},
    top: true,
    bottom: true,
    updatedAt: +new Date(),
    tailing: tailing
  };
};

updateTaskGroup = function(state, taskGroupId, update) {
  var newState;
  newState = Object.assign([], state);
  newState[taskGroupId] = Object.assign({}, state[taskGroupId], update);
  return newState;
};

filterLogLines = function(lines, search) {
  return _.filter(lines, function(arg) {
    var data;
    data = arg.data;
    return new RegExp(search).test(data);
  });
};

TIMESTAMP_REGEX = [[/^(\d{2}:\d{2}:\d{2}\.\d{3})/, 'HH:mm:ss.SSS'], [/^[A-Z \[]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/, 'YYYY-MM-DD HH:mm:ss,SSS'], [/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/, 'YYYY-MM-DD HH:mm:ss,SSS']];

parseLineTimestamp = function(line) {
  var group, j, len, match;
  for (j = 0, len = TIMESTAMP_REGEX.length; j < len; j++) {
    group = TIMESTAMP_REGEX[j];
    match = line.match(group[0]);
    if (match) {
      return moment(match, group[1]).valueOf();
    }
  }
  return null;
};

buildEmptyBuffer = function(taskId, offset) {
  return {
    offset: offset,
    taskId: taskId,
    data: ''
  };
};

ACTIONS = {
  LOG_INIT: function(state, arg) {
    var search, taskIdGroups;
    taskIdGroups = arg.taskIdGroups, search = arg.search;
    return taskIdGroups.map(function(taskIds) {
      return buildTaskGroup(taskIds, search);
    });
  },
  LOG_ADD_TASK_GROUP: function(state, arg) {
    var search, taskIds;
    taskIds = arg.taskIds, search = arg.search;
    return _.sortBy(state.concat(buildTaskGroup(taskIds, search)), function(taskGroup) {
      return getTaskDataFromTaskId(taskGroup.taskIds[0]).instanceNo;
    });
  },
  LOG_REMOVE_TASK: function(state, arg) {
    var j, len, newLogLines, newState, newTaskIds, taskGroup, taskId;
    taskId = arg.taskId;
    newState = [];
    for (j = 0, len = state.length; j < len; j++) {
      taskGroup = state[j];
      if (indexOf.call(taskGroup.taskIds, taskId) >= 0) {
        if (taskGroup.taskIds.length === 1) {
          continue;
        }
        newTaskIds = _.without(taskGroup.taskIds, taskId);
        newLogLines = taskGroup.logLines.filter(function(logLine) {
          return logLine.taskId !== taskId;
        });
        newState.push(Object.assign({}, taskGroup, {
          tasksIds: newTasksIds,
          logLines: newLogLines
        }));
      } else {
        newState.push(taskGroup);
      }
    }
    return newState;
  },
  LOG_TASK_GROUP_TOP: function(state, arg) {
    var taskGroupId, visible;
    taskGroupId = arg.taskGroupId, visible = arg.visible;
    return updateTaskGroup(state, taskGroupId, {
      top: visible,
      tailing: false
    });
  },
  LOG_TASK_GROUP_BOTTOM: function(state, arg) {
    var taskGroupId, visible;
    taskGroupId = arg.taskGroupId, visible = arg.visible;
    return updateTaskGroup(state, taskGroupId, {
      bottom: visible
    });
  },
  LOG_TASK_GROUP_READY: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return updateTaskGroup(state, taskGroupId, {
      ready: true,
      updatedAt: +new Date(),
      top: true,
      bottom: true,
      tailing: true
    });
  },
  LOG_TASK_GROUP_TAILING: function(state, arg) {
    var tailing, taskGroupId;
    taskGroupId = arg.taskGroupId, tailing = arg.tailing;
    return updateTaskGroup(state, taskGroupId, {
      tailing: tailing
    });
  },
  LOG_REMOVE_TASK_GROUP: function(state, arg) {
    var i, j, newState, ref, taskGroupId;
    taskGroupId = arg.taskGroupId;
    newState = [];
    for (i = j = 0, ref = state.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      if (i !== taskGroupId) {
        newState.push(state[i]);
      }
    }
    return newState;
  },
  LOG_EXPAND_TASK_GROUP: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return [state[taskGroupId]];
  },
  LOG_SCROLL_TO_TOP: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return updateTaskGroup(state, taskGroupId, resetTaskGroup());
  },
  LOG_SCROLL_ALL_TO_TOP: function(state) {
    return state.map(function(taskGroup) {
      return Object.assign({}, taskGroup, resetTaskGroup());
    });
  },
  LOG_SCROLL_TO_BOTTOM: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return updateTaskGroup(state, taskGroupId, resetTaskGroup(true));
  },
  LOG_SCROLL_ALL_TO_BOTTOM: function(state) {
    return state.map(function(taskGroup) {
      return Object.assign({}, taskGroup, resetTaskGroup(true));
    });
  },
  LOG_REQUEST_START: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return updateTaskGroup(state, taskGroupId, {
      pendingRequests: true
    });
  },
  LOG_REQUEST_END: function(state, arg) {
    var taskGroupId;
    taskGroupId = arg.taskGroupId;
    return updateTaskGroup(state, taskGroupId, {
      pendingRequests: false
    });
  },
  LOG_TASK_DATA: function(state, arg) {
    var append, currentOffset, data, firstLine, lastLine, lastTimestamp, lines, linesRemovedFromTop, maxLines, newLogLines, newState, newTaskBuffer, nextOffset, offset, prependedLineCount, taskBuffer, taskGroup, taskGroupId, taskId, updatedAt;
    taskGroupId = arg.taskGroupId, taskId = arg.taskId, offset = arg.offset, nextOffset = arg.nextOffset, maxLines = arg.maxLines, data = arg.data, append = arg.append;
    taskGroup = state[taskGroupId];
    if (data.length === 0 && task.loadedData) {
      return state;
    }
    currentOffset = offset;
    lines = _.initial(data.match(/[^\n]*(\n|$)/g)).map(function(data) {
      var detectedTimestamp, timestamp;
      currentOffset += data.length;
      data = data.replace('\r', '');
      timestamp = parseLineTimestamp(data);
      if (timestamp) {
        detectedTimestamp = true;
      }
      return {
        timestamp: timestamp,
        data: data,
        offset: currentOffset - data.length,
        taskId: taskId
      };
    });
    taskBuffer = taskGroup.taskBuffer[taskId] || buildEmptyBuffer(taskId, 0);
    if (append) {
      if (taskBuffer.offset + taskBuffer.data.length === offset) {
        firstLine = _.first(lines);
        lines = _.rest(lines);
        taskBuffer = {
          offset: taskBuffer.offset,
          data: taskBuffer.data + firstLine.data,
          taskId: taskId
        };
        if (taskBuffer.data.endsWith('\n')) {
          taskBuffer.timestamp = parseLineTimestamp(taskBuffer.data);
          lines.unshift(taskBuffer);
          taskBuffer = buildEmptyBuffer(taskId, nextOffset);
        }
      }
      if (lines.length > 0) {
        lastLine = _.last(lines);
        if (!lastLine.data.endsWith('\n')) {
          taskBuffer = lastLine;
          lines = _.initial(lines);
        }
      }
    } else {
      if (nextOffset === taskBuffer.offset) {
        lastLine = _.last(lines);
        lines = _.initial(lines);
        taskBuffer = {
          offset: nextOffset - lastLine.data.length,
          data: lastLine.data + taskBuffer.data,
          taskId: taskId
        };
        if (lines.length > 0) {
          taskBuffer.timestamp = parseLineTimestamp(taskBuffer.data);
          lines.push(taskBuffer);
          taskBuffer = buildEmptyBuffer(taskId, offset);
        }
      }
      if (lines.length > 0) {
        firstLine = _.first(lines);
        if (firstLine.offset > 0) {
          taskBuffer = firstLine;
          lines = _.rest(lines);
        }
      }
    }
    newTaskBuffer = Object.assign({}, taskGroup.taskBuffer);
    newTaskBuffer[taskId] = taskBuffer;
    if (taskGroup.logLines.length > 0) {
      lastTimestamp = _.last(taskGroup.logLines).timestamp;
    } else {
      lastTimestamp = 0;
    }
    lines = lines.map(function(line) {
      if (line.timestamp) {
        lastTimestamp = line.timestamp;
      } else {
        line.timestamp = lastTimestamp;
      }
      return line;
    });
    prependedLineCount = 0;
    linesRemovedFromTop = 0;
    updatedAt = +new Date();
    if (taskGroup.search) {
      lines = filterLogLines(lines, taskGroup.search);
    }
    newLogLines = Object.assign([], taskGroup.logLines);
    if (append) {
      newLogLines = newLogLines.concat(lines);
      if (newLogLines.length > maxLines) {
        linesRemovedFromTop = newLogLines.length - maxLines;
        newLogLines = newLogLines.slice(newLogLines.length - maxLines);
      }
    } else {
      newLogLines = lines.concat(newLogLines);
      prependedLineCount = lines.length;
      if (newLogLines.length > maxLines) {
        newLogLines = newLogLines.slice(0, maxLines);
      }
    }
    if (taskGroup.taskIds.length > 1) {
      newLogLines = _.sortBy(newLogLines, function(arg1) {
        var offset, timestamp;
        timestamp = arg1.timestamp, offset = arg1.offset;
        return [timestamp, offset];
      });
    }
    newState = Object.assign([], state);
    newState[taskGroupId] = Object.assign({}, state[taskGroupId], {
      taskBuffer: newTaskBuffer,
      logLines: newLogLines,
      prependedLineCount: prependedLineCount,
      linesRemovedFromTop: linesRemovedFromTop,
      updatedAt: updatedAt
    });
    return newState;
  }
};

module.exports = function(state, action) {
  if (state == null) {
    state = [];
  }
  if (action.type in ACTIONS) {
    return ACTIONS[action.type](state, action);
  } else {
    return state;
  }
};
