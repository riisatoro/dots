import loadState from './local_state';
import authReducer from './reducers/authReducer';
import domainReducer from './reducers/domainReducer';
import uiReducer from './reducers/uiReducer';
import gameReducer from './reducers/gameReducer';
import appReducer from './reducers/appReducer';

const initialState = loadState();

export default function reducer(state = initialState, action) {
  return {
    auth: authReducer(state.auth, action),
    domainData: domainReducer(state.domainData, action),
    gameData: gameReducer(state.gameData, action),
    appData: appReducer(state.appData, action),
    uiData: uiReducer(state.uiData, action),
  };
}
