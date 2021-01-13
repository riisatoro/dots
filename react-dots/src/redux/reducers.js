import TYPES from './types';

import loadState from './local_state';

const initialState = loadState();
const colorTitle = ['O', 'R', 'B', 'Y', 'G'];

export default function updateState(state = initialState, action) {
  switch (action.type) {
    case TYPES.RECEIVE_AUTH_REPLY: {
      if (action.payload.status === 200) {
        const { data } = action.payload;
        if (data.error) {
          return { ...state, reply: { error: data.error, message: data.message } };
        }
        return {
          ...state,
          reply: { error: false, message: '' },
          user: { auth: true, username: data.username, token: data.token },
          components: { },
        };
      }
      return {
        ...state, reply: { error: true, message: 'Server connection error. Try later.' },
      };
    }

    case TYPES.RECEIVE_LEADERS: {
      if (action.payload.status === 200) {
        return {
          ...state,
          leaders: action.payload.data.data,
          components: { showLeaders: true },
          game_end: false,
        };
      }
      return { ...state, leaders: [] };
    }

    case TYPES.COLOR_CHOOSED: {
      return { ...state, playerColor: colorTitle[action.payload.color] };
    }

    case TYPES.FIELD_SIZE_CHANGED: {
      const newSize = action.payload.size;
      return { ...state, field_size: parseInt(newSize, 10) };
    }

    case TYPES.SEND_LOGOUT_REQUEST: {
      return {
        ...state,
        user: { auth: false, token: '' },
        components: { },
        game_end: false,
      };
    }

    case TYPES.UPDATE_GAME_ROOMS: {
      if (action.payload.status === 200) {
        return { ...state, rooms: action.payload.data.free_room };
      }
      return { ...state, rooms: [] };
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
          components: { gameField: true },
          field: reply.field,
          turn: state.user.username,
          gameStarted: true,
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
          components: { gameField: true },
          field: reply.field,
          turn: 'NaN',
          gameStarted: true,
          loops: [],
        };
      }
      return { ...state };
    }

    case TYPES.PLAYER_SET_DOT: {
      const { data } = action.payload;
      if (data.is_full) {
        return {
          ...state,
          field: data.field,
          players: data.players,
          turn: data.turn,
          gameEnd: data.is_full,
          loops: data.loops,
          playerColors: data.colors,

          components: { gameField: false },
          gameStarted: false,
          gameResults: true,
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
      };
    }

    case TYPES.WS_MESSAGE_UPDATE: {
      return { ...state, wsMessage: action.payload };
    }

    case TYPES.SOCKET_DISCONNECT: {
      return {
        ...state,
        components: { gameField: false },
        game_end: true,
        gameStarted: false,
        gameResults: true,
      };
    }

    case TYPES.INTERRUPT_GAME_COMPONENT: {
      return {
        ...state,
        components: { gameField: false },
        game_end: true,
        gameStarted: false,
        gameResults: true,
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

    default:
      return { ...state };
  }
}
