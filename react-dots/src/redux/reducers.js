import { TYPES } from './types';

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
          leaders: action.payload.data,
          components: { showLeaders: true },
          game_end: false,
        };
      }
      return { ...state, leaders: [] };
    }

    case TYPES.COLOR_CHOOSED: {
      return { ...state, playerColor: colorTitle[action.payload.color] };
    }

    case TYPES.CALC_CAPTURED: {
      return { ...state };
    }

    case TYPES.HIDE_LEADERS: {
      return { ...state, components: { showLeaders: false } };
    }

    case TYPES.HIDE_RESULTS: {
      return { ...state, game_end: false };
    }

    case TYPES.SHOW_AUTH_FORM: {
      return { ...state, components: { auth: true }, game_end: false };
    }

    case TYPES.HIDE_AUTH_FORM: {
      return { ...state, components: { auth: false } };
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

    case TYPES.SHOW_SETTINGS: {
      return {
        ...state,
        components: { showSettings: true },
        players: [
          {
            name: 'anon', color: 'green', index: -1, captured: 0,
          },
          {
            name: 'anon', color: 'red', index: -1, captured: 0,
          },
        ],
      };
    }

    case TYPES.HIDE_SETTINGS: {
      return { ...state, components: { showSettings: false } };
    }

    case TYPES.START_NEW_GAME: {
      return {
        ...state,
        components: { showSettings: false },
      };
    }

    case TYPES.STOP_GAME: {
      let winner = '';
      let looser = '';
      let winScore = 0;
      let looseScore = 0;
      const equal = state.players[0].captured === state.players[1].captured;

      if (state.players[0].captured >= state.players[1].captured) {
        winner = state.players[0].name;
        looser = state.players[1].name;
        winScore = state.players[0].captured;
        looseScore = state.players[1].captured;
      } else {
        winner = state.players[1].name;
        looser = state.players[0].name;
        winScore = state.players[1].captured;
        looseScore = state.players[0].captured;
      }
      const results = {
        winner,
        looser,
        win_score: winScore,
        loose_score: looseScore,
        equal,
      };

      return {
        ...state, components: { showField: false }, results, game_end: true,
      };
    }

    case TYPES.DRAW_DOT: {
      const x = action.payload[1];
      const y = action.payload[0];
      const { field } = state;
      const playerColor = state.players[state.turn].color;

      if (field[x][y] === 'E') {
        field[x][y] = playerColor;
      }
      return { ...state };
    }

    case TYPES.SET_COLOR: {
      const { players } = state;
      const thisPlayer = action.payload.player - 1;
      const thisColor = action.payload.color;
      players[thisPlayer].color = thisColor;
      return { ...state, players };
    }

    case TYPES.CHECK_FIELD_FULL: {
      return { ...state };
    }

    case TYPES.UPDATE_PLAYERS_NAME: {
      const NewPlayers = state.players;
      NewPlayers[0].name = action.payload.p1;
      NewPlayers[1].name = action.payload.p2;
      return { ...state, players: NewPlayers };
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
          isGameStarted: false,
        };
        return {
          ...state,
          socket: socketData,
          components: { gameField: true },
          field: reply.field,
          turn: state.user.username,
          gameEnd: false,
        };
      }
      return { ...state, gameEnd: false };
    }

    case TYPES.PLAYER_JOIN_ROOM: {
      if (action.payload.status === 200) {
        const reply = action.payload.data;
        const socketData = {
          connect: true,
          roomId: parseInt(reply.room_id, 10),
          fieldSize: reply.field_size,
          turn: false,
          isGameStarted: false,
        };
        return {
          ...state,
          socket: socketData,
          components: { gameField: true },
          field: reply.field,
          turn: 'NaN',
          gameEnd: false,
        };
      }
      return { ...state };
    }

    case TYPES.PLAYER_SET_DOT: {
      return {
        ...state,
        field: action.payload.data.field,
        captured: action.payload.data.captured,
        turn: action.payload.data.turn,
        gameEnd: action.payload.data.is_full,
      };
    }

    case TYPES.WS_MESSAGE_UPDATE: {
      return { ...state, wsMessage: action.payload };
    }

    case TYPES.SOCKET_DISCONNECT: {
      return { ...state, components: { showSettings: true } };
    }

    case TYPES.INTERRUPT_GAME_COMPONENT: {
      return {
        ...state,
        components: { gameField: false, game_end: true, showSettings: true },
      };
    }

    default:
      return { ...state };
  }
}
