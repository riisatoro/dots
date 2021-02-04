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
        activeGameTab: gameId[0],
      };
    }

    case TYPES.SET_ACTIVE_GAME_TAB: {
      return {
        ...state,
        activeGameTab: data,
      };
    }

    case TYPES.OPEN_MODAL_COLOR: {
      return { ...state, modalColorContrast: true };
    }

    case TYPES.OPEN_MODAL_LIMIT: {
      return { ...state, modalLimitReached: true };
    }

    case TYPES.CLOSE_MODAL: {
      return {
        ...state,
        modalColorContrast: false,
        modalLimitReached: false,
      };
    }

    default: return { ...state };
  }
}
