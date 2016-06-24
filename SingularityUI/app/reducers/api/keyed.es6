import buildApiActionReducer from './base';

export default function buildKeyedApiActionReducer(ActionGroup, initialData={}) {

  const baseReducer = buildApiActionReducer(ActionGroup, initialData);

  return function reducer(state={}, action) {
    if (action.type == ActionGroup.CLEAR) {
      console.log('clear');
      return {};
    } else if (_.contains([ActionGroup.ERROR, ActionGroup.SUCCESS, ActionGroup.STARTED], action.type)) {
      const newState = {};
      newState[action.key] = baseReducer(state[action.key], action);
      return _.extend({}, state, newState);
    } else {
      return state;
    }
  };
}
