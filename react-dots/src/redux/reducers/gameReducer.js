import TYPES from '../types';

export default function gameReducer(state, action) {
  const data = action.payload;
  switch (action.type) {
    case TYPES.UPDATE_TMP_COLOR: {
      return {
        ...state,
        temporary: {
          playerColor: data.color,
          fieldSize: state.temporary.fieldSize,
        },
      };
    }

    case TYPES.UPDATE_ROOMS: {
      return {
        ...state,
        waitingGames: data.waiting,
        currentGames: data.current,
        availableGames: data.available,
      };
    }

    default: return { ...state };
  }
}
