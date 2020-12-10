import {
  SEND_REGISTER_REQUEST,
  DRAW_DOT, SHOW_AUTH_FORM,
  HIDE_AUTH_FORM,
  SEND_LOGIN_REQUEST,
  SEND_LOGOUT_REQUEST,
  SHOW_SETTINGS,
  HIDE_SETTINGS,
  START_NEW_GAME,
  STOP_GAME,
  SET_COLOR,
  CHECK_FIELD_FULL,
  UPDATE_PLAYERS_NAME,
  HIDE_RESULTS,
  HIDE_LEADERS,
  RECEIVE_LEADERS,
  RECEIVE_AUTH_REPLY,
  COLOR_CHOOSED,
  FIELD_SIZE_CHANGED,
  CALC_CAPTURED,
  UPDATE_GAME_ROOMS,
} from './types';
import loadState from './local_state';
import getEmptyField from './getEmptyField';

const initialState = loadState();
const colorTitle = ['O', 'R', 'B', 'Y', 'G'];

export default function updateState(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_AUTH_REPLY: {
      if (action.payload.status === 200) {
        const { data } = action.payload;
        if (data.error) {
          return { ...state, reply: { error: data.error, message: data.message } };
        }
        return {
          ...state,
          reply: { error: false, message: '' },
          user: { auth: true, token: data.token },
          components: { },
        };
      }
      return {
        ...state, reply: { error: true, message: 'Server connection error. Try later.' },
      };
    }

    case RECEIVE_LEADERS: {
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

    case COLOR_CHOOSED: {
      const playersSet = state.players;
      playersSet[action.payload.player].index = action.payload.color;
      playersSet[action.payload.player].color = colorTitle[action.payload.color];
      return { ...state, players: playersSet };
    }

    case CALC_CAPTURED: {
      return { ...state };
    }

    case HIDE_LEADERS: {
      return { ...state, components: { showLeaders: false } };
    }

    case HIDE_RESULTS: {
      return { ...state, game_end: false };
    }

    case SHOW_AUTH_FORM: {
      return { ...state, components: { auth: true }, game_end: false };
    }

    case HIDE_AUTH_FORM: {
      return { ...state, components: { auth: false } };
    }

    case FIELD_SIZE_CHANGED: {
      const newSize = action.payload.size;
      const newTmpField = getEmptyField(newSize);
      return { ...state, field: newTmpField, field_size: newSize };
    }

    case SEND_REGISTER_REQUEST: {
      return { ...state };
    }

    case SEND_LOGIN_REQUEST: {
      if (action.payload.status === 200) {
        return { ...state, components: { auth: false }, user: { auth: true } };
      }
      return { ...state };
    }

    case SEND_LOGOUT_REQUEST: {
      return {
        ...state,
        user: { auth: false, token: '' },
        components: { },
        game_end: false,
      };
    }

    case SHOW_SETTINGS: {
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

    case HIDE_SETTINGS: {
      return { ...state, components: { showSettings: false, showField: true } };
    }

    case START_NEW_GAME: {
      const tmpField = getEmptyField(state.field_size);
      return {
        ...state,
        components: { showSettings: false, showField: true },
        field: tmpField,
      };
    }

    case STOP_GAME: {
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

    case DRAW_DOT: {
      const x = action.payload[1];
      const y = action.payload[0];
      const { field } = state;
      const playerColor = state.players[state.turn].color;

      if (field[x][y] === 'E') {
        field[x][y] = playerColor;
      }
      return { ...state };
    }

    case SET_COLOR: {
      const { players } = state;
      const thisPlayer = action.payload.player - 1;
      const thisColor = action.payload.color;
      players[thisPlayer].color = thisColor;
      return { ...state, players };
    }

    case CHECK_FIELD_FULL: {
      return { ...state };
    }

    case UPDATE_PLAYERS_NAME: {
      const NewPlayers = state.players;
      NewPlayers[0].name = action.payload.p1;
      NewPlayers[1].name = action.payload.p2;
      return { ...state, players: NewPlayers };
    }

    case UPDATE_GAME_ROOMS: {
      if (action.payload.status === 200) {
        return { ...state, rooms: action.payload.data.free_room };
      }
      return { ...state, rooms: [] };
    }

    default:
      return { ...state };
  }
}
