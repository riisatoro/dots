const TYPES = {
  LOCAL_STORAGE: 'reduxDots',

  /* AUTH */
  LOGIN_REPLY: 'LOGIN_REPLY',
  LOGIN_ERROR: 'LOGIN_ERROR',
  REGISTRATION_REPLY: 'REGISTRATION_REPLY',
  REGISTRATION_ERROR: 'REGISTRATION_ERROR',
  LOGOUT_REPLY: 'LOGOUT_REPLY',
  LOGOUT_ERROR: 'LOGOUT_ERROR',
  CLOSE_TOAST: 'CLOSE_TOAST',

  /* DOMAIN DATA */
  UPDATE_LEADERS: 'UPDATE_LEADERS',
  UPDATE_LEADERS_ERROR: 'UPDATE_LEADERS_ERROR',
  UPDATE_FREE_ROOMS: 'UPDATE_FREE_ROOMS',
  UPDATE_AVAILABLE_ROOMS: 'UPDATE_AVAILABLE_ROOMS',

  /* GAME DATA */
  UPDATE_ROOMS: 'UPDATE_ROOMS',
  UPDATE_TMP_COLOR: 'UPDATE_TMP_COLOR',

  /* UI DATA */
  CLOSE_MODAL: 'CLOSE_MODAL',
  SWITCH_PAGINATION: 'SWITCH_PAGINATION',
  SET_ACTIVE_GAME_TAB: 'SET_ACTIVE_GAME_TAB',
  OPEN_MODAL_COLOR: 'OPEN_MODAL_COLOR',
  OPEN_MODAL_LIMIT: 'OPEN_MODAL_LIMIT',

  /* SOCKET */
  SOCKET_OPEN: 'SOCKET_OPEN',
  SOCKET_ERROR: 'SOCKET_ERROR',
  SOCKET_CLOSE: 'SOCKET_CLOSE',
  PLAYER_JOIN_GAME: 'PLAYER_JOIN_GAME',
  PLAYER_LEAVE: 'PLAYER_LEAVE',
  PLAYER_SET_DOT: 'PLAYER_SET_DOT',

};

export default TYPES;
