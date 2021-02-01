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

    case TYPES.UPDATE_PLAYER_ROOMS: {
      return {
        ...state,
        userGames: data.data,
      };
    }

    case TYPES.UPDATE_AVAILABLE_ROOMS: {
      if (data.data === undefined) {
        return {
          ...state,
          availableGames: data,
        };
      }
      return {
        ...state,
        availableGames: data.data,
      };
    }

    default: return { ...state };
  }
}
