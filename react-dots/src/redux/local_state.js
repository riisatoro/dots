import TYPES from './types';

const setInitial = () => (
  {
    auth: {
      id: null,
      token: '',
      username: '',
      isAuthorized: false,
      error: false,
      errorMessage: '',
    },

    domainData: {
      leaderboards: [],
    },

    gameData: {
      temporary: {
        playerColor: '#AAAAAA',
      },
      waitingGames: {},
      currentGames: {},
      awailableGames: {},
    },

    appData: {
      roomLimit: 6,
      cellSize: 30,
    },

    uiData: {
      matchPagination: 1,
      activeGameTab: 0,
      modalColorContrast: false,
      modalLimitRooms: false,
    },
  }
);

const loadState = () => {
  const state = localStorage[TYPES.LOCAL_STORAGE];
  if (state === undefined) {
    return setInitial();
  }
  return JSON.parse(state);
};

export default loadState;
