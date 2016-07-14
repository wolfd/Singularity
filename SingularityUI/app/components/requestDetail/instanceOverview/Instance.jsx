import React, { PropTypes } from 'react';

import classNames from 'classnames';

import JSONButton from '../../common/JSONButton';

const mapped = {
  TASK_LAUNCHED: 'LAUNCHING',
  TASK_STAGING: 'LAUNCHING',
  TASK_STARTING: 'LAUNCHING',
  TASK_RUNNING: 'RUNNING',
  TASK_CLEANING: 'CLEANING',
  TASK_KILLING: '',
  TASK_FINISHED: '',
  TASK_FAILED: '',
  TASK_KILLED: '',
  TASK_LOST: '',
  TASK_LOST_WHILE_DOWN: '',
  TASK_ERROR: '',
};

const Instance = ({task, lb}) => {
  const type = task.pendingTask ? 'PENDING' : mapped[task.lastTaskState];

  const classes = classNames({
    instance: true,
    lb,
    [`instance-${type}`]: true,
  });

  return (
    <JSONButton object={task}><div className="instance-wrapper">
      <div className={classes}>
        <div className="fader" />
      </div>
    </div></JSONButton>
  );
};

Instance.propTypes = {
  task: PropTypes.object.isRequired
};

export default Instance;
