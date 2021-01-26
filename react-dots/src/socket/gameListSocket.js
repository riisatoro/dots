function connectSocket() {
  const socket = new WebSocket('ws://127.0.0.1:8000/ws/rooms/update/');
  return socket;
}

export default connectSocket;
