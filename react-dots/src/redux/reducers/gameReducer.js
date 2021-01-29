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

    case TYPES.UPDATE_PLAYER_ROOMS: {
      console.log(data);
      return {
        ...state,
        userGames: data.data,
      };
    }

    case TYPES.UPDATE_PLAYER_ROOMS_ERROR: {
      return { ...state };
    }

    default: return { ...state };
  }
}
