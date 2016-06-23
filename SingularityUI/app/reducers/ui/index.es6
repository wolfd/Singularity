import { combineReducers } from 'redux';

import starred from './starred';
import requestsPage from './requestsPage';

export default combineReducers({
  starred,
  requestsPage
});
