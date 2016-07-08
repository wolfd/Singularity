export const SET_LOADING = 'SET_LOADING';

export const SetLoading = (loading) => {
  return (dispatch) => {
    dispatch({
      type: SET_LOADING,
      value: loading
    });
  };
};
