import { Server, Socket } from 'socket.io';
import { User } from '../entity/User';

enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  SAVE_USER = 'save_user',
  SEND_ITEMS = 'send_items',
  DELIVER_ITEMS = 'deliver_items',
  OPEN_TRADE = 'open_trade',
  ACCEPT_TRADE = 'accept_trade',
  DECLINE_TRADE = 'decline_trade',
  DECLINE_EXISTING_TRADE = 'decline_existing_trade',
  SENDER_ACKNOWLEDGE = 'sender_acknowledge',
  RECIPIENT_ACKNOWLEDGE = 'recipient_acknowledge',
  REQUEST_USER_STATUS = 'request_user_status',
  RECIPIENT_STATUS = 'recipient_status'
}

interface ConnectedUser {
  socketId: string;
  userId: string;
  trading: {
    isTrading: boolean;
    withWho: string;
  };
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

const userFactory = (userId: string, socketId: string): ConnectedUser => ({
  userId,
  socketId,
  trading: {
    isTrading: false,
    withWho: ''
  },
  acceptTrade: false,
  sendingItems: [],
  receivingItems: []
});

const retrieveUsers = (recipientId: string, senderId: string) => {
  const recipient = connectedUsers.find((u) => u.userId === recipientId);
  const sender = connectedUsers.find((u) => u.socketId === senderId);
  return [recipient, sender];
};

const resetUser = (user: ConnectedUser) => userFactory(user.userId, user.socketId);

socket.on(SocketEvents.CONNECTION, (socket: Socket) => {
  console.log(`connected : ${socket.id}`);

  socket.on(SocketEvents.SAVE_USER, (userId: string) => {
    if (userId && existingUser(userId) === -1) {
      const user = userFactory(userId, socket.id);
      connectedUsers.push(user);
    }
  });

  socket.on(SocketEvents.RECIPIENT_STATUS, (data: Partial<SendItemData>) => {
    const { survivor } = data;
    const [recipient, sender] = retrieveUsers(survivor.id, socket.id);
    socket.emit(SocketEvents.RECIPIENT_STATUS, recipient);
  });

  socket.on(SocketEvents.OPEN_TRADE, (
    data: { survivor: Partial<User>, sender: string }
  ) => {
    const { survivor } = data;
    const [recipient, sender] = retrieveUsers(survivor.id, socket.id);
    sender.trading = {
      isTrading: true,
      withWho: recipient.socketId
    };

    if (!recipient.trading.isTrading) {
      socket.to(recipient.socketId).emit(SocketEvents.OPEN_TRADE, `${sender.userId} wants to trade`);
    }
  });

  socket.on(SocketEvents.SEND_ITEMS, (data: SendItemData) => {
    const { items, survivor } = data;
    const [recipient, sender] = retrieveUsers(survivor.id, socket.id);

    if (recipient && sender) {
      // check if either of sender or recipient is already on a trade
      if (recipient.trading.withWho !== socket.id) {
        return socket.emit(SocketEvents.DECLINE_EXISTING_TRADE, 'This user is already on a trade');
      }
      if (recipient.trading.isTrading && sender.trading.isTrading) {
        recipient.receivingItems = items;
        sender.sendingItems = items;

        socket.to(recipient.socketId).emit(SocketEvents.DELIVER_ITEMS, items);
      }
    }
  });

  socket.on(SocketEvents.ACCEPT_TRADE, (data: Partial<SendItemData>) => {
    const { survivor } = data;
    const [recipient, sender] = retrieveUsers(survivor.id, socket.id);

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
    const [recipient, sender] = retrieveUsers(survivor.id, socket.id);
    const recipientIndex = existingUser(survivor.id);
    const senderIndex = existingSocket(socket.id);

    if (recipient && sender) {
      connectedUsers.splice(recipientIndex, 1, resetUser(recipient));
      connectedUsers.splice(senderIndex, 1, resetUser(sender));
    }

    socket.to(recipient.socketId).emit(SocketEvents.DECLINE_TRADE);
    socket.emit(SocketEvents.DECLINE_TRADE);
    console.log(connectedUsers);
  });

  socket.on(SocketEvents.REQUEST_USER_STATUS, (data: Partial<SendItemData>) => {
    const { survivor } = data;
    const user = existingUser(survivor.id);
    socket.emit(SocketEvents.REQUEST_USER_STATUS, { status: user !== -1 });
  });

  socket.on(SocketEvents.DISCONNECT, (reason: string) => {
    const user = existingSocket(socket.id);
    if (user !== -1) connectedUsers.splice(user, 1);
    console.log(`disconnected : ${socket.id} ${reason}`);
    console.log(connectedUsers);
  });
});
