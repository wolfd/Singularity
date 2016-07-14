import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Utils from '../../../utils';

import Instance from './Instance';

const Deploy = ({requestId, deployId, pendingTasksAPI, activeTasks}) => {
  if (!pendingTasksAPI || !activeTasks) {
    return null;
  }
  const pendingTasksForDeploy = (pendingTasksAPI.data || []).filter((tId) => (
    tId.deployId === deployId && tId.requestId === requestId
  ));

  const activeTasksForDeploy = activeTasks.filter((d) => (
    d.taskId.deployId === deployId
  ));

  const allTasksForDeploy = [...activeTasksForDeploy, ...pendingTasksForDeploy];


  const instances = allTasksForDeploy.map((t, i) => <Instance key={i} task={t} />);
  return (
    <tr className="deploys">
      <td className="deploy-id">{deployId}</td>
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
  pendingTasksAPI: state.api.pendingTaskIds,
  activeTasks: Utils.maybe(
    state.api.activeTasksForRequest,
    [ownProps.requestId, 'data'],
    []
  )
});

export default connect(
  mapStateToProps
)(Deploy);
