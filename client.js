//A client to test the web socket
const io = require('socket.io-client');

let socket = io.connect('http://localhost:8080/music-rooms');

let payload = {
    roomName: 'RoomTest',
    roomDescription: 'Awesome room',
    limit: 5,
    host: 'FakeClient',
    uuid: "4798-4294-4240-0183"
}

socket.emit('create-room', payload);