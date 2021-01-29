import TYPES from '../types';

export default function authReducer(auth, action) {
  const data = action.payload;
  switch (action.type) {
    case TYPES.LOGIN_REPLY: {
      return {
        ...auth,
        id: data.id,
        token: data.token,
        username: data.username,
        isAuthorized: true,
        error: false,
      };
    }

    case TYPES.LOGIN_ERROR: {
      return {
        ...auth,
        error: true,
        errorMessage: data.message,
        isAuthorized: false,
      };
    }

    case TYPES.REGISTRATION_REPLY: {
      return {
        ...auth,
        error: false,
        isAuthorized: true,
      };
    }

    case TYPES.REGISTRATION_ERROR: {
      return {
        ...auth,
        error: true,
        errorMessage: data.message,
        isAuthorized: false,
      };
    }

    case TYPES.LOGOUT_REPLY: {
      return {
        ...auth,
        id: null,
        token: '',
        username: '',
        error: false,
        isAuthorized: false,
      };
    }

    case TYPES.LOGOUT_ERROR: {
      return {
        ...auth,
        error: true,
        errorMessage: 'Server is not available',
      };
    }

    case TYPES.CLOSE_TOAST: {
      return {
        ...auth,
        error: false,
        errorMessage: '',
      };
    }

    default:
      return { ...auth };
  }
}
