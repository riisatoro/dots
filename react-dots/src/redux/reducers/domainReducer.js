import TYPES from '../types';

export default function domainReducer(state, action) {
  const data = action.payload;
  switch (action.type) {
    case TYPES.UPDATE_LEADERS: {
      return {
        ...state,
        matches: data.data,
      };
    }

    case TYPES.UPDATE_LEADERS_ERROR: {
      return {
        ...state,
        matches: [],
      };
    }

    case TYPES.UPDATE_FREE_ROOMS: {
      return {
        ...state,
        freeRooms: data.data,
      };
    }

    default: return { ...state };
  }
}
