import TYPES from '../redux/types';

const proxy = process.env.REACT_APP_PROXY;
const socket = new WebSocket(`ws://${proxy}/ws/global/`);

function connectSocket(dispatch, user) {
  socket.onopen = (msg) => {
    dispatch({ type: TYPES.SOCKET_OPEN, payload: msg });
  };

  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    dispatch({ type: data.type, payload: { data: data.data, user } });
  };

  socket.onerror = (msg) => {
    dispatch({ type: TYPES.SOCKET_ERROR, payload: msg });
  };

  socket.onclose = (msg) => {
    dispatch({ type: TYPES.SOCKET_CLOSE, payload: msg });
  };
}

export { connectSocket, socket };
