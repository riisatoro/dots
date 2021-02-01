import TYPES from '../types';

export default function appReducer(state, action) {
  // const data = action.payload;
  switch (action.type) {
    case TYPES.PLAYER_JOIN: {
      return {
        ...state,
      };
    }

    default: return { ...state };
  }
}
