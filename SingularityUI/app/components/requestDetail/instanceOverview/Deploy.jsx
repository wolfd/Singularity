import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import classNames from 'classnames';

import Utils from '../../../utils';

import Instance from './Instance';

const getInstanceNo = (task) => {
  return parseInt(Utils.maybe(
    task,
    ['taskId', 'instanceNo']
  ) || Utils.maybe(
    task,
    ['pendingTask', 'pendingTaskId', 'instanceNo']
  ), 10);
};

const Deploy = ({requestId, deployId, pending, active, pendingTasksAPI, activeTasks}) => {
  if (!pendingTasksAPI || !activeTasks) {
    return null;
  }
  const pendingTasksForDeploy = (pendingTasksAPI.data || []).filter((s) => (
    Utils.maybe(s, ['pendingTask', 'pendingTaskId', 'deployId']) === deployId
  ));

  const activeTasksForDeploy = activeTasks.filter((d) => (
    d.taskId.deployId === deployId
  ));

  const allTasksForDeploy = [...activeTasksForDeploy, ...pendingTasksForDeploy];

  allTasksForDeploy.sort((a, b) => {
    return getInstanceNo(a) - getInstanceNo(b);
  });

  const instances = allTasksForDeploy.map((t, i) => <Instance key={i} task={t} lb={active} />);


  const deployClassNames = classNames(
    'deploy-id',
    {
      'deploy-pending': pending,
      'deploy-active': active
    }
  );

  return (
    <tr className="deploys">
      <td className={deployClassNames}>
        <a href={`${config.appRoot}/request/${requestId}/deploy/${deployId}`}>
          {deployId}
        </a>
      </td>
      <td>
        <div className="instances">
          {instances}
        </div>
      </td>
    </tr>
  );
};

Deploy.propTypes = {
  requestId: PropTypes.string.isRequired,
  deployId: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  pendingTasksAPI: Utils.maybe(
    state.api.scheduledTasksForRequest,
    [ownProps.requestId]
  ),
  activeTasks: Utils.maybe(
    state.api.activeTasksForRequest,
    [ownProps.requestId, 'data'],
    []
  )
});

export default connect(
  mapStateToProps
)(Deploy);
