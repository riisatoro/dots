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

    case TYPES.UPDATE_AVAILABLE_ROOMS: {
      const { user } = action.payload;
      const { available } = data.data;
      const filtered = {};

      Object.keys(available).forEach((key) => {
        if (!Object.keys(available[key].players).includes(user.toString())) {
          filtered[parseInt(key, 10)] = available[key];
        }
      });
      return {
        ...state,
        availableGames: filtered,
      };
    }

    default: return { ...state };
  }
}
