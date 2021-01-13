import { Server, Socket } from 'socket.io';
import {
  SocketEvents, OpenTradeProps, SendItemData, ConnectedUser
} from './model';
import { TradeController } from './TradeController';

const socket = new Server(3001, {
  cors: {
    origin: '*'
  }
});

const connectedUsers: ConnectedUser[] = [];

socket.on(SocketEvents.CONNECTION, (io: Socket) => {
  const tradeController = new TradeController(io, connectedUsers);
  console.log(`connected : ${io.id}`);

  io.on(SocketEvents.SAVE_USER, (userId: string) => {
    tradeController.saveUser(userId);
  });

  io.on(SocketEvents.RECIPIENT_STATUS, (data: Partial<SendItemData>) => {
    tradeController.recipientStatus(data);
  });

  io.on(SocketEvents.OPEN_TRADE, (data: OpenTradeProps) => {
    tradeController.openTrade(data);
  });

  io.on(SocketEvents.SEND_ITEMS, (data: SendItemData) => {
    tradeController.sendItems(data);
  });

  io.on(SocketEvents.ACCEPT_TRADE, (data: Partial<SendItemData>) => {
    tradeController.acceptTrade(data);
  });

  io.on(SocketEvents.DECLINE_TRADE, (data: Partial<SendItemData>) => {
    tradeController.declineTrade(data);
  });

  io.on(SocketEvents.REQUEST_USER_STATUS, (data: Partial<SendItemData>) => {
    tradeController.requestUserStatus(data);
  });

  io.on(SocketEvents.DISCONNECT, (reason: string) => {
    tradeController.disconnect(reason);
  });
});
