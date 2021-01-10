import { Server, Socket } from 'socket.io';

enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
}

const socket = new Server(3001, {
  cors: {
    origin: '*'
  }
});

socket.on(SocketEvents.CONNECTION, (socket: Socket) => {
  console.log(`connected : ${socket.id}`);

  socket.on(SocketEvents.DISCONNECT, (reason: string) => {
    console.log(`disconnected : ${socket.id} ${reason}`);
  });
});
