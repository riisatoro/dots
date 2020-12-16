function connectSocket(roomID) {
  const socket = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomID}/`);
  return socket;
}

export default connectSocket;
