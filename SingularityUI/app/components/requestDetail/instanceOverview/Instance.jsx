import React, { PropTypes } from 'react';

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

const Instance = ({task}) => {
  const type = task.pendingType ? 'PENDING' : mapped[task.lastTaskState];
  return (
    <div className="instance-wrapper">
      <div className={`instance instance-${type}`}>
        <div className="fader" />
      </div>
    </div>
  );
};

Instance.propTypes = {
  task: PropTypes.object.isRequired
};

export default Instance;
