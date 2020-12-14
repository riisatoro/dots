function receiveMessage(data) {
  console.log(data);
}

const socket = new WebSocket('ws://127.0.0.1:8000/ws/room/1/');
socket.onmessage = (evt) => receiveMessage(evt.data);
socket.onerror = () => console.log('Error');

export default socket;
