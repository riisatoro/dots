import { createStore } from 'redux';
import { TYPES } from './types';
import updateState from './reducers';

const store = createStore(updateState);

store.subscribe(() => {
  localStorage[TYPES.LOCAL_STORAGE] = JSON.stringify(store.getState());
});

export default store;
