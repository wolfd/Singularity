var LogLine, React, _, classNames, clickPermalink, connect, mapDispatchToProps, mapStateToProps,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

classNames = require('classnames');

_ = require('underscore');

connect = require('react-redux').connect;

clickPermalink = require('../actions').clickPermalink;

LogLine = (function(superClass) {
  extend(LogLine, superClass);

  function LogLine() {
    return LogLine.__super__.constructor.apply(this, arguments);
  }

  LogLine.propTypes = {
    offset: React.PropTypes.number.isRequired,
    isHighlighted: React.PropTypes.bool.isRequired,
    content: React.PropTypes.string.isRequired,
    taskId: React.PropTypes.string.isRequired,
    showDebugInfo: React.PropTypes.bool,
    color: React.PropTypes.string,
    search: React.PropTypes.string,
    clickPermalink: React.PropTypes.func.isRequired
  };

  LogLine.prototype.highlightContent = function(content) {
    var j, last, lastEnd, len, m, matches, regex, search, sect, sections;
    search = this.props.search;
    if (!search || _.isEmpty(search)) {
      if (this.props.showDebugInfo) {
        return this.props.offset + " | " + this.props.timestamp + " | " + content;
      } else {
        return content;
      }
    }
    regex = RegExp(search, 'g');
    matches = [];
    while (m = regex.exec(content)) {
      matches.push(m);
    }
    sections = [];
    lastEnd = 0;
    for (j = 0, len = matches.length; j < len; j++) {
      m = matches[j];
      last = {
        text: content.slice(lastEnd, m.index),
        match: false
      };
      sect = {
        text: content.slice(m.index, m.index + m[0].length),
        match: true
      };
      sections.push(last, sect);
      lastEnd = m.index + m[0].length;
    }
    sections.push({
      text: content.slice(lastEnd),
      match: false
    });
    return sections.map((function(_this) {
      return function(s, i) {
        var spanClass;
        spanClass = classNames({
          'search-match': s.match
        });
        return React.createElement("span", {
          "key": i,
          "className": spanClass
        }, s.text);
      };
    })(this));
  };

  LogLine.prototype.render = function() {
    var divClass;
    divClass = classNames({
      line: true,
      highlightLine: this.props.isHighlighted
    });
    return React.createElement("div", {
      "className": divClass,
      "style": {
        backgroundColor: this.props.color
      }
    }, React.createElement("a", {
      "href": config.appRoot + "/task/" + this.props.taskId + "/tail/" + this.props.path + "#" + this.props.offset,
      "className": "offset-link",
      "onClick": ((function(_this) {
        return function() {
          return _this.props.clickPermalink(_this.props.offset);
        };
      })(this))
    }, React.createElement("div", {
      "className": "pre-line"
    }, React.createElement("span", {
      "className": "glyphicon glyphicon-link",
      "data-offset": "" + this.props.offset
    }))), React.createElement("span", null, this.highlightContent(this.props.content)));
  };

  return LogLine;

})(React.Component);

mapStateToProps = function(state, ownProps) {
  return {
    search: state.search,
    showDebugInfo: state.showDebugInfo,
    path: state.path
  };
};

mapDispatchToProps = {
  clickPermalink: clickPermalink
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(LogLine);
