import TYPES from '../types';

export default function globalReducer(state, action) {
  switch (action.type) {
    case TYPES.RECEIVE_LEADERS: {
      if (action.payload.status === 200) {
        return {
          ...state,
          leaders: action.payload.data.data,
          components: {
            showLeaders: true,
          },
          game_end: false,
        };
      }
      return {
        ...state,
        leaders: [],
        gameStarted: false,
      };
    }

    case TYPES.COLOR_CHOOSED: {
      return {
        ...state,
        playerColor: action.payload.color,
      };
    }

    case TYPES.FIELD_SIZE_CHANGED: {
      const newSize = action.payload.size;
      return {
        ...state,
        field_size: parseInt(newSize, 10),
      };
    }

    // case TYPES.UPDATE_GAME_ROOMS: {
    //   return {
    //     ...state,
    //     rooms: action.payload.rooms,
    //   };
    // }

    case TYPES.PLAYER_SET_DOT: {
      const {
        data,
      } = action.payload;
      if (data.is_full) {
        return {
          ...state,
          field: data.field,
          players: data.players,
          turn: data.turn,
          gameEnd: data.is_full,
          loops: data.loops,
          playerColors: data.colors,
          score: data.score,
          modal: true,

          components: {
            gameField: false,
          },
          gameStarted: false,
          gameResults: false,
        };
      }
      return {
        ...state,
        field: data.field,
        players: data.players,
        turn: data.turn,
        gameEnd: data.is_full,
        loops: data.loops,
        playerColors: data.colors,
        score: data.score,
      };
    }

    case TYPES.WS_MESSAGE_UPDATE: {
      return {
        ...state,
        wsMessage: action.payload,
      };
    }

    case TYPES.SOCKET_DISCONNECT: {
      return {
        ...state,
        components: {
          gameField: false,
        },
        game_end: true,
        gameStarted: false,
        gameResults: false,
        modal: true,
      };
    }

    case TYPES.INTERRUPT_GAME_COMPONENT: {
      return {
        ...state,
        components: {
          gameField: false,
        },
        game_end: true,
        gameStarted: false,
        gameResults: false,
      };
    }

    case TYPES.CLOSE_RESULTS: {
      return {
        ...state,
        gameResults: false,
        gameStarted: false,
        gameField: false,
      };
    }

    // case TYPES.SET_MODAL: {
    //   return {
    //     ...state,
    //     modal: !action.payload,
    //     gameResults: false,
    //     gameStarted: false,
    //     gameField: false,
    //   };
    // }

    case TYPES.SET_ACTIVE_PAGINATION: {
      return {
        ...state,
        activeLeadersPage: action.payload.num,
      };
    }

    default:
      return {
        ...state,
      };
  }
}
