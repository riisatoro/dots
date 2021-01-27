import TYPES from './types';

import {
  loadState,
  setInitial,
} from './local_state';

const initialState = loadState();

export default function updateState(state = initialState, action) {
  switch (action.type) {
    case TYPES.RECEIVE_AUTH_REPLY: {
      if (action.payload.status === 200) {
        const { data } = action.payload;
        return {
          ...state,
          reply: {
            error: false,
            message: '',
          },
          user: {
            auth: true,
            username: data.username,
            token: data.token,
            userID: data.id,
          },
          components: {},
        };
      }
      return {
        ...state,
        reply: {
          error: true,
          toast: true,
          toastMessage: 'Server connection error. Try later.',
        },
      };
    }

    case TYPES.LOGIN_ERROR: {
      let message = 'Server error. Try later';
      if (action.payload.message !== undefined) {
        message = action.payload.message;
      }
      return {
        ...state,
        toast: true,
        toastMessage: message,
      };
    }

    case TYPES.SERVER_TOAST: {
      return {
        ...state,
        toast: false,
      };
    }

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

    case TYPES.SEND_LOGOUT_REQUEST: {
      localStorage.clear();
      const clearState = setInitial();
      return {
        ...clearState,
      };
    }

    case TYPES.UPDATE_GAME_ROOMS: {
      return {
        ...state,
        rooms: action.payload.rooms,
      };
    }

    case TYPES.NEW_ROOM_CREATED: {
      if (action.payload.status === 200) {
        const reply = action.payload.data;
        const socketData = {
          connect: true,
          roomId: parseInt(reply.room_id, 10),
          fieldSize: reply.field_size,
          turn: false,
          loops: [],
        };
        return {
          ...state,
          socket: socketData,
          components: {
            gameField: true,
          },
          field: reply.field.field,
          turn: reply.turn,
          playerColors: reply.colors,
          gameStarted: true,
          score: reply.score,
          loops: [],
        };
      }
      return {
        ...state,
        gameEnd: false,
        gameStarted: false,
        loops: [],
      };
    }

    case TYPES.PLAYER_JOIN_ROOM: {
      if (action.payload.status === 200) {
        const reply = action.payload.data;
        const socketData = {
          connect: true,
          roomId: parseInt(reply.room_id, 10),
          fieldSize: reply.field_size,
          turn: false,
          loops: [],
        };
        return {
          ...state,
          socket: socketData,
          components: {
            gameField: true,
          },
          field: reply.field.field,
          turn: reply.turn,
          playerColors: reply.colors,
          gameStarted: true,
          score: reply.score,
          loops: [],
        };
      }
      return {
        ...state,
      };
    }

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

    case TYPES.SET_MODAL: {
      return {
        ...state,
        modal: !action.payload,
        gameResults: false,
        gameStarted: false,
        gameField: false,
      };
    }

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
