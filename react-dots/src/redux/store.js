import { createStore } from 'redux';
import TYPES from './types';
import reducer from './reducer';

const store = createStore(reducer);

store.subscribe(() => {
  localStorage[TYPES.LOCAL_STORAGE] = JSON.stringify(store.getState());
});

export default store;
