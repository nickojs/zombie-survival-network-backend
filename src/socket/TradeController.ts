/* eslint-disable consistent-return */
import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage
} from 'socket-controllers';
import { Socket } from 'socket.io';
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

interface OpenTradeProps {
  survivor: Partial<User>;
  sender: string;
}

@SocketController()
export class TradeController {
  private connectedUsers: ConnectedUser[] = [];

  getConnectedUserIndex(id: string) {
    return this.connectedUsers.findIndex((u) => u.userId === id);
  }

  getConnectedUserData(id: string) {
    return this.connectedUsers.find((u) => u.userId === id);
  }

  getConnectedSocketIndex(id: string) {
    return this.connectedUsers.findIndex((u) => u.socketId === id);
  }

  getConnectedSocketData(id: string) {
    return this.connectedUsers.find((u) => u.socketId === id);
  }

  connectedUserFactory(userId: string, socketId: string): ConnectedUser {
    return {
      userId,
      socketId,
      trading: {
        isTrading: false,
        withWho: ''
      },
      acceptTrade: false,
      sendingItems: [],
      receivingItems: []
    };
  }

  resetUser(user: ConnectedUser) {
    return this.connectedUserFactory(user.userId, user.socketId);
  }

  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    console.log('client connected: ', socket.id);
  }

  @OnMessage(SocketEvents.SAVE_USER)
  saveUser(@ConnectedSocket() socket: Socket, @MessageBody() userId: string) {
    const existingUser = this.getConnectedUserIndex(userId);
    if (existingUser && existingUser === -1) {
      const user = this.connectedUserFactory(userId, socket.id);
      this.connectedUsers.push(user);
    }
    console.log(this.connectedUsers);
  }

  @OnMessage(SocketEvents.RECIPIENT_STATUS)
  recipientStatus(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    const { survivor } = data;
    const recipient = this.getConnectedUserData(survivor.id);
    socket.emit(SocketEvents.RECIPIENT_STATUS, recipient);
  }

  @OnMessage(SocketEvents.OPEN_TRADE)
  openTrade(@ConnectedSocket() socket: Socket, @MessageBody() data: OpenTradeProps) {
    const { survivor } = data;
    const recipient = this.getConnectedUserData(survivor.id);
    const sender = this.getConnectedSocketData(socket.id);
    sender.trading = {
      isTrading: true,
      withWho: recipient.socketId
    };

    if (!recipient.trading.isTrading) {
      socket.to(recipient.socketId).emit(SocketEvents.OPEN_TRADE, `${sender.userId} wants to trade`);
    }
  }

  @OnMessage(SocketEvents.SEND_ITEMS)
  sendItems(@ConnectedSocket() socket: Socket, @MessageBody() data: SendItemData) {
    const { items, survivor } = data;
    const recipient = this.getConnectedUserData(survivor.id);
    const sender = this.getConnectedSocketData(socket.id);

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
  }

  @OnMessage(SocketEvents.ACCEPT_TRADE)
  acceptTrade(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    const { survivor } = data;
    const recipient = this.getConnectedUserData(survivor.id);
    const sender = this.getConnectedSocketData(socket.id);

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
  }

  @OnMessage(SocketEvents.DECLINE_TRADE)
  declineTrade(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    const { survivor } = data;
    const recipient = this.getConnectedUserData(survivor.id);
    const recipientIndex = this.getConnectedUserIndex(survivor.id);

    const sender = this.getConnectedSocketData(socket.id);
    const senderIndex = this.getConnectedSocketIndex(socket.id);

    if (recipient && sender) {
      this.connectedUsers.splice(recipientIndex, 1, this.resetUser(recipient));
      this.connectedUsers.splice(senderIndex, 1, this.resetUser(sender));
    }

    socket.to(recipient.socketId).emit(SocketEvents.DECLINE_TRADE);
    socket.emit(SocketEvents.DECLINE_TRADE);
    console.log(this.connectedUsers);
  }

  @OnMessage(SocketEvents.REQUEST_USER_STATUS)
  requestUserStatus(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    const { survivor } = data;
    const user = this.getConnectedUserIndex(survivor.id);
    socket.emit(SocketEvents.REQUEST_USER_STATUS, { status: user !== -1 });
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log('client disconnected: ', socket.id);
  }
}
