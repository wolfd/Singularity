import { combineReducers } from 'redux';

import starred from './starred';
import refresh from './refresh';
import form from './form';
import globalSearch from './globalSearch';
import rootComponent from './rootComponent';

export default combineReducers({
  starred,
  refresh,
  form,
  globalSearch,
  rootComponent
});
