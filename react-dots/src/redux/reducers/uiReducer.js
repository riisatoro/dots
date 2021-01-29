import TYPES from '../types';

export default function uiReducer(state, action) {
  const data = action.payload;
  switch (action.type) {
    case TYPES.SWITCH_PAGINATION: {
      return {
        ...state,
        matchPagination: data.num,
      };
    }

    default: return { ...state };
  }
}
