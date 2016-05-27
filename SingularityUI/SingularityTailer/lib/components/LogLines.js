var Humanize, LogLine, LogLines, React, _, connect, mapDispatchToProps, mapStateToProps, ref, sum, taskGroupBottom, taskGroupTop,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

LogLine = require('./LogLine');

Humanize = require('humanize-plus');

_ = require('underscore');

connect = require('react-redux').connect;

ref = require('../actions'), taskGroupTop = ref.taskGroupTop, taskGroupBottom = ref.taskGroupBottom;

sum = function(numbers) {
  var j, len, n, total;
  total = 0;
  for (j = 0, len = numbers.length; j < len; j++) {
    n = numbers[j];
    total += n;
  }
  return total;
};

LogLines = (function(superClass) {
  extend(LogLines, superClass);

  function LogLines() {
    this.handleScroll = bind(this.handleScroll, this);
    return LogLines.__super__.constructor.apply(this, arguments);
  }

  LogLines.propTypes = {
    taskGroupTop: React.PropTypes.func.isRequired,
    taskGroupBottom: React.PropTypes.func.isRequired,
    taskGroupId: React.PropTypes.number.isRequired,
    logLines: React.PropTypes.array.isRequired,
    initialDataLoaded: React.PropTypes.bool.isRequired,
    reachedStartOfFile: React.PropTypes.bool.isRequired,
    reachedEndOfFile: React.PropTypes.bool.isRequired,
    bytesRemainingBefore: React.PropTypes.number.isRequired,
    bytesRemainingAfter: React.PropTypes.number.isRequired,
    activeColor: React.PropTypes.string.isRequired
  };

  LogLines.prototype.componentDidMount = function() {
    return window.addEventListener('resize', this.handleScroll);
  };

  LogLines.prototype.componentWillUnmount = function() {
    return window.removeEventListener('resize', this.handleScroll);
  };

  LogLines.prototype.componentDidUpdate = function(prevProps, prevState) {
    if (prevProps.updatedAt !== this.props.updatedAt) {
      if (this.props.tailing) {
        return this.refs.tailContents.scrollTop = this.refs.tailContents.scrollHeight;
      } else if (this.props.prependedLineCount > 0 || this.props.linesRemovedFromTop > 0) {
        return this.refs.tailContents.scrollTop += 20 * (this.props.prependedLineCount - this.props.linesRemovedFromTop);
      } else {
        return this.handleScroll();
      }
    }
  };

  LogLines.prototype.renderLoadingPrevious = function() {
    if (this.props.initialDataLoaded) {
      if (!this.props.reachedStartOfFile) {
        if (this.props.search) {
          return React.createElement("div", null, "Searching for \'", this.props.search, "\'... (", Humanize.filesize(this.props.bytesRemainingBefore), " remaining)");
        } else {
          return React.createElement("div", null, "Loading previous... (", Humanize.filesize(this.props.bytesRemainingBefore), " remaining)");
        }
      }
    }
  };

  LogLines.prototype.renderLogLines = function() {
    return this.props.logLines.map((function(_this) {
      return function(arg) {
        var data, offset, taskId, timestamp;
        data = arg.data, offset = arg.offset, taskId = arg.taskId, timestamp = arg.timestamp;
        return React.createElement(LogLine, {
          "content": data,
          "key": taskId + '_' + offset,
          "offset": offset,
          "taskId": taskId,
          "timestamp": timestamp,
          "isHighlighted": offset === _this.props.initialOffset,
          "color": _this.props.colorMap[taskId]
        });
      };
    })(this));
  };

  LogLines.prototype.renderLoadingMore = function() {
    if (this.props.terminated) {
      return null;
    }
    if (this.props.initialDataLoaded) {
      if (this.props.reachedEndOfFile) {
        if (this.props.search) {
          return React.createElement("div", null, "Tailing for \'", this.props.search, "\'...");
        } else {
          return React.createElement("div", null, "Tailing...");
        }
      } else {
        if (this.props.search) {
          return React.createElement("div", null, "Searching for \'", this.props.search, "\'... (", Humanize.filesize(this.props.bytesRemainingAfter), " remaining)");
        } else {
          return React.createElement("div", null, "Loading more... (", Humanize.filesize(this.props.bytesRemainingAfter), " remaining)");
        }
      }
    }
  };

  LogLines.prototype.handleScroll = function() {
    var clientHeight, ref1, scrollHeight, scrollTop;
    ref1 = this.refs.tailContents, scrollTop = ref1.scrollTop, scrollHeight = ref1.scrollHeight, clientHeight = ref1.clientHeight;
    if (scrollTop < clientHeight) {
      this.props.taskGroupTop(this.props.taskGroupId, true);
    } else {
      this.props.taskGroupTop(this.props.taskGroupId, false);
    }
    if (scrollTop + clientHeight > scrollHeight - clientHeight) {
      return this.props.taskGroupBottom(this.props.taskGroupId, true, scrollTop + clientHeight > scrollHeight - 20);
    } else {
      return this.props.taskGroupBottom(this.props.taskGroupId, false);
    }
  };

  LogLines.prototype.render = function() {
    return React.createElement("div", {
      "className": "contents-container"
    }, React.createElement("div", {
      "className": "tail-contents " + this.props.activeColor,
      "ref": "tailContents",
      "onScroll": this.handleScroll
    }, this.renderLoadingPrevious(), this.renderLogLines(), this.renderLoadingMore()));
  };

  return LogLines;

})(React.Component);

mapStateToProps = function(state, ownProps) {
  var colorMap, i, j, len, ref1, taskGroup, taskId, tasks;
  taskGroup = state.taskGroups[ownProps.taskGroupId];
  tasks = taskGroup.taskIds.map(function(taskId) {
    return state.tasks[taskId];
  });
  colorMap = {};
  if (taskGroup.taskIds.length > 1) {
    i = 0;
    ref1 = taskGroup.taskIds;
    for (j = 0, len = ref1.length; j < len; j++) {
      taskId = ref1[j];
      colorMap[taskId] = "hsla(" + ((360 / taskGroup.taskIds.length) * i) + ", 100%, 50%, 0.1)";
      i++;
    }
  }
  return {
    logLines: taskGroup.logLines,
    updatedAt: taskGroup.updatedAt,
    tailing: taskGroup.tailing,
    prependedLineCount: taskGroup.prependedLineCount,
    linesRemovedFromTop: taskGroup.linesRemovedFromTop,
    activeColor: state.activeColor,
    top: taskGroup.top,
    bottom: taskGroup.bottom,
    initialDataLoaded: _.all(_.pluck(tasks, 'initialDataLoaded')),
    terminated: _.all(_.pluck(tasks, 'terminated')),
    reachedStartOfFile: _.all(tasks.map(function(arg) {
      var minOffset;
      minOffset = arg.minOffset;
      return minOffset === 0;
    })),
    reachedEndOfFile: _.all(tasks.map(function(arg) {
      var filesize, maxOffset;
      maxOffset = arg.maxOffset, filesize = arg.filesize;
      return maxOffset >= filesize;
    })),
    bytesRemainingBefore: sum(_.pluck(tasks, 'minOffset')),
    bytesRemainingAfter: sum(tasks.map(function(arg) {
      var filesize, maxOffset;
      filesize = arg.filesize, maxOffset = arg.maxOffset;
      return Math.max(filesize - maxOffset, 0);
    })),
    colorMap: colorMap,
    search: state.search
  };
};

mapDispatchToProps = {
  taskGroupTop: taskGroupTop,
  taskGroupBottom: taskGroupBottom
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(LogLines);
