import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Utils from '../../../utils';

import Deploy from './Deploy';

const InstanceOverview = ({requestId, requestParentAPI, pendingTasksAPI, activeTasks}) => {
  if (!requestParentAPI.data || !pendingTasksAPI || !activeTasks) {
    return null;
  }

  const { activeDeploy, pendingDeploy } = requestParentAPI.data;

  const deploys = [];

  const pastActiveTasksForRequest = activeTasks.filter((d) => (
    (!activeDeploy || d.taskId.deployId !== activeDeploy.id) && (!pendingDeploy || d.taskId.deployId !== pendingDeploy.id)
  ));
  if (pastActiveTasksForRequest.length) {
    const pastDeploys = _.uniq(pastActiveTasksForRequest.map((v) => v.taskId.deployId));
    pastDeploys.forEach((id) => {
      deploys.push(<Deploy key={id} requestId={requestId} deployId={id} />);
    });
  }

  if (activeDeploy) {
    deploys.push(<Deploy key={activeDeploy.id} requestId={requestId} deployId={activeDeploy.id} active={true} />);
  }

  if (pendingDeploy) {
    deploys.push(<Deploy key={pendingDeploy.id} requestId={requestId} deployId={pendingDeploy.id} pending={true} />);
  }

  return (
    <table className="instance-overview">
      <tbody>
        {deploys}
      </tbody>
    </table>
  );
};

InstanceOverview.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestParentAPI: PropTypes.object,
  pendingTasksAPI: PropTypes.object,
  activeTasks: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  requestParentAPI: Utils.maybe(
    state.api.request,
    [ownProps.requestId]
  ),
  pendingTasksAPI: state.api.scheduledTasksForRequest,
  activeTasks: Utils.maybe(
    state.api.activeTasksForRequest,
    [ownProps.requestId, 'data'],
    []
  )
});

export default connect(
  mapStateToProps
)(InstanceOverview);
