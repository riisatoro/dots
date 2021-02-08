import TYPES from '../redux/types';

const socket = new WebSocket('ws://127.0.0.1:8000/ws/global/');

function connectSocket(dispatch, user) {
  console.log(process);
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
