import TYPES from '../types';

export default function appReducer(state, action) {
  // const data = action.payload;
  // console.log(action.type);
  switch (action.type) {
    case TYPES.PLAYER_JOIN: {
      return {
        ...state,
      };
    }

    default: return { ...state };
  }
}
