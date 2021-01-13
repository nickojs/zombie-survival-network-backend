import { Socket } from 'socket.io';
import {
  ConnectedUser, OpenTradeProps, SendItemData, SocketEvents
} from './model';

export class TradeController {
  constructor(private socket: Socket, private connectedUsers: ConnectedUser[]) {
    this.socket = socket;
    this.connectedUsers = connectedUsers;
  }

  private getConnectedUserIndex(id: string) {
    return this.connectedUsers.findIndex((u) => u.userId === id);
  }

  private getConnectedUserData(id: string) {
    return this.connectedUsers.find((u) => u.userId === id);
  }

  private getConnectedSocketIndex(id: string) {
    return this.connectedUsers.findIndex((u) => u.socketId === id);
  }

  private getConnectedSocketData(id: string) {
    return this.connectedUsers.find((u) => u.socketId === id);
  }

  private userFactory(userId: string, socketId: string): ConnectedUser {
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
    return this.userFactory(user.userId, user.socketId);
  }

  saveUser(userId: string) {
    if (userId && this.getConnectedUserIndex(userId) === -1) {
      const user = this.userFactory(userId, this.socket.id);
      this.connectedUsers.push(user);
    }
  }

  recipientStatus(data: Partial<SendItemData>) {
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      this.socket.emit(SocketEvents.RECIPIENT_STATUS, recipient);
    } catch (error) {
      console.log(error);
    }
  }

  openTrade(data: OpenTradeProps) {
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const sender = this.getConnectedSocketData(this.socket.id);
      sender.trading = {
        isTrading: true,
        withWho: recipient.socketId
      };

      if (!recipient.trading.isTrading) {
        this.socket.to(recipient.socketId).emit(SocketEvents.OPEN_TRADE, `${sender.userId} wants to trade`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // eslint-disable-next-line consistent-return
  sendItems(data: SendItemData) {
    try {
      const { items, survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const sender = this.getConnectedSocketData(this.socket.id);

      if (recipient && sender) {
        // check if either of sender or recipient is already on a trade
        if (recipient.trading.withWho !== this.socket.id) {
          return this.socket.emit(SocketEvents.DECLINE_EXISTING_TRADE, 'This user is already on a trade');
        }
        if (recipient.trading.isTrading && sender.trading.isTrading) {
          recipient.receivingItems = items;
          sender.sendingItems = items;

          this.socket.to(recipient.socketId).emit(SocketEvents.DELIVER_ITEMS, items);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  acceptTrade(data: Partial<SendItemData>) {
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const sender = this.getConnectedSocketData(this.socket.id);

      if (recipient && sender) {
        if (recipient.acceptTrade) {
          console.log('both accepted');
          // method to update both user's inventories
          // emit successful trade
        }
        sender.acceptTrade = true;
        this.socket.to(recipient.socketId).emit(SocketEvents.RECIPIENT_ACKNOWLEDGE);
        this.socket.emit(SocketEvents.SENDER_ACKNOWLEDGE);
      }
    } catch (error) {
      console.log(error);
    }
  }

  declineTrade(data: Partial<SendItemData>) {
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const recipientIndex = this.getConnectedUserIndex(survivor.id);

      const sender = this.getConnectedSocketData(this.socket.id);
      const senderIndex = this.getConnectedSocketIndex(this.socket.id);

      if (recipient && sender) {
        this.connectedUsers.splice(recipientIndex, 1, this.resetUser(recipient));
        this.connectedUsers.splice(senderIndex, 1, this.resetUser(sender));
      }

      this.socket.to(recipient.socketId).emit(SocketEvents.DECLINE_TRADE);
      this.socket.emit(SocketEvents.DECLINE_TRADE);
    } catch (error) {
      console.log(error);
    }
  }

  requestUserStatus(data: Partial<SendItemData>) {
    const { survivor } = data;
    const user = this.getConnectedUserIndex(survivor.id);
    this.socket.emit(SocketEvents.REQUEST_USER_STATUS, { status: user !== -1 });
  }

  disconnect(reason: string) {
    const user = this.getConnectedSocketIndex(this.socket.id);
    if (user !== -1) this.connectedUsers.splice(user, 1);
    console.log(`disconnected : ${this.socket.id} ${reason}`);
    console.log(this.connectedUsers);
  }
}
