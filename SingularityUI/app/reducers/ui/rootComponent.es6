import * as RootComponentActions from '../../actions/ui/rootComponent';

const initialState = {
  loading: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RootComponentActions.SET_LOADING:
      return {
        loading: action.value
      };
    default:
      return state;
  }
};
