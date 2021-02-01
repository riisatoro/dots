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

    case TYPES.UPDATE_ROOMS: {
      const gameId = [];
      Object.keys(data.current).forEach((x) => {
        gameId.push(parseInt(x, 10));
      });
      Object.keys(data.waiting).forEach((x) => {
        gameId.push(parseInt(x, 10));
      });
      return {
        ...state,
        activeGameTab: Math.max(...gameId),
      };
    }

    case TYPES.SET_ACTIVE_GAME_TAB: {
      return {
        ...state,
        activeGameTab: data,
      };
    }

    default: return { ...state };
  }
}
