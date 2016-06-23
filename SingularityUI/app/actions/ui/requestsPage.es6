// actions for the Requests page go here
export const TOGGLE_STATE_FILTER = 'TOGGLE_STATE_FILTER';

export const toggleStateFilter = (stateValue) => ({
  type: TOGGLE_STATE_FILTER,
  value: stateValue
});

export const CHANGE_TYPE_FILTER = 'CHANGE_TYPE_FILTER';

export const changeTypeFilter = (typeValue) => ({
  type: CHANGE_TYPE_FILTER,
  value: typeValue
});

export const CHANGE_TEXT_FILTER = 'CHANGE_TEXT_FILTER';

export const changeTextFilter = (textValue) => ({
  type: CHANGE_TEXT_FILTER,
  value: textValue
});
