import { Server, Socket } from 'socket.io';
import { User } from '../entity/User';

enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  SAVE_USER = 'save_user',
  SEND_ITEMS = 'send_items',
  DELIVER_ITEMS = 'deliver_items',
  ACCEPT_TRADE = 'accept_trade',
  DECLINE_TRADE = 'decline_trade',
  SENDER_ACKNOWLEDGE = 'sender_acknowledge',
  RECIPIENT_ACKNOWLEDGE = 'recipient_acknowledge'
}

interface ConnectedUser {
  socketId: string;
  userId: string;
  isTrading: boolean;
  acceptTrade: boolean;
  sendingItems: any[] // OSRS items
  receivingItems: any[] // OSRS items
}

interface SendItemData {
  survivor: User;
  items: Record<string, any>[]
}

const socket = new Server(3001, {
  cors: {
    origin: '*'
  }
});

const connectedUsers: ConnectedUser[] = [];

const existingUser = (id: string) => connectedUsers.findIndex((u) => u.userId === id);
const existingSocket = (id: string) => connectedUsers.findIndex((u) => u.socketId === id);
// const currentUser = (socketId: string) => connectedUsers.find((u) => u.socketId === socketId);

const userFactory = (userId: string, socketId: string) => ({
  userId,
  socketId,
  isTrading: false,
  acceptTrade: false,
  sendingItems: [],
  receivingItems: []
});

const resetUser = (user: ConnectedUser) => userFactory(user.userId, user.socketId);

socket.on(SocketEvents.CONNECTION, (socket: Socket) => {
  console.log(`connected : ${socket.id}`);

  socket.on(SocketEvents.SAVE_USER, (userId: string) => {
    if (userId && existingUser(userId) === -1) {
      const user = userFactory(userId, socket.id);
      connectedUsers.push(user);
      console.log(connectedUsers);
    }
  });

  socket.on(SocketEvents.SEND_ITEMS, (data: SendItemData) => {
    const { items, survivor } = data;
    const recipient = connectedUsers.find((u) => u.userId === survivor.id);
    const sender = connectedUsers.find((u) => u.socketId === socket.id);

    // check if either of sender or recipient is already on a trade

    if (recipient && sender) {
      // needs to check if trade was accepted and reset it, or prevent to add new items
      recipient.receivingItems = items;
      sender.sendingItems = items;
      console.log(connectedUsers);
      socket.to(recipient.socketId).emit(SocketEvents.DELIVER_ITEMS, items);
    }
  });

  socket.on(SocketEvents.ACCEPT_TRADE, (data: Partial<SendItemData>) => {
    const { survivor } = data;
    const recipient = connectedUsers.find((u) => u.userId === survivor.id);
    const sender = connectedUsers.find((u) => u.socketId === socket.id);

    if (recipient && sender) {
      if (recipient.acceptTrade) {
        console.log('both accepted');
        // method to update both user's inventories
        // emit successful trade
      }
      sender.acceptTrade = true;
      socket.to(recipient.socketId).emit(SocketEvents.RECIPIENT_ACKNOWLEDGE);
      socket.emit(SocketEvents.SENDER_ACKNOWLEDGE);
    }
  });

  socket.on(SocketEvents.DECLINE_TRADE, (data: Partial<SendItemData>) => {
    const { survivor } = data;

    const recipient = connectedUsers.find((u) => u.userId === survivor.id);
    const recipientIndex = connectedUsers.findIndex((u) => u.userId === survivor.id);

    const sender = connectedUsers.find((u) => u.socketId === socket.id);
    const senderIndex = connectedUsers.findIndex((u) => u.socketId === socket.id);

    connectedUsers.splice(recipientIndex, 1, resetUser(recipient));
    connectedUsers.splice(senderIndex, 1, resetUser(sender));

    console.log(connectedUsers);
    socket.emit(SocketEvents.DECLINE_TRADE);
  });

  socket.on(SocketEvents.DISCONNECT, (reason: string) => {
    const findUser = existingSocket(socket.id);
    if (findUser !== -1) connectedUsers.splice(findUser, 1);
    console.log(`disconnected : ${socket.id} ${reason}`);
    console.log(connectedUsers);
  });
});
