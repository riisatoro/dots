import { createStore } from 'redux';
import { LOCAL_STORAGE } from './types';
import updateState from './reducers';

const store = createStore(updateState);

store.subscribe(() => {
  localStorage[LOCAL_STORAGE] = JSON.stringify(store.getState());
});

export default store;
