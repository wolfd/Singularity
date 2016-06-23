import { connect } from 'react-redux';

import { getFilteredRequests } from '../../selectors/api';

import RequestsTableWrapper from '../../components/requests/RequestsTableWrapper';

const mapStateToProps = (state) => {
  return {
    filteredRequests: getFilteredRequests(state),
    requestsAPI: state.api.requests,
  };
};

const FilteredRequestsTable = connect(
  mapStateToProps
)(RequestsTableWrapper);

export default FilteredRequestsTable;
