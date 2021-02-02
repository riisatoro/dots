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

    case TYPES.PLAYER_SET_DOT: {
      const updates = JSON.parse(data.data);
      if (Object.keys(state.currentGames).includes(updates.data.room.toString())) {
        const updatedGames = { ...state.currentGames };
        updatedGames[updates.data.room] = {
          size: updates.data.field.field.length - 2,
          players: updates.data.field.players,
          field: updates.data.field,
          turn: updates.data.field.turn,
        };
        return {
          ...state,
          currentGames: updatedGames,
        };
      }
      return { ...state };
    }

    default: return { ...state };
  }
}
