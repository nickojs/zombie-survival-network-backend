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
import { getRepository } from 'typeorm';
import { Item } from '../entity/Item';
import { User } from '../entity/User';
import {
  ConnectedUser, OpenTradeProps, SendItemData, SocketErrors, SocketEvents
} from './model';

@SocketController()
export class TradeController {
  private connectedUsers: ConnectedUser[] = [];

  private userRepository = getRepository(User);

  private itemRepository = getRepository(Item);

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

  connectedUserFactory(userId: string, username: string, socketId: string): ConnectedUser {
    return {
      userId,
      socketId,
      username,
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
    return this.connectedUserFactory(user.userId, user.username, user.socketId);
  }

  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    console.log('client connected: ', socket.id);
  }

  @OnMessage(SocketEvents.SAVE_USER)
  saveUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { userId: string, username: string }
  ) {
    const { userId, username } = data;
    const existingUser = this.getConnectedUserIndex(userId);
    if (existingUser && existingUser === -1) {
      const user = this.connectedUserFactory(userId, username, socket.id);
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
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const sender = this.getConnectedSocketData(socket.id);
      sender.trading = {
        isTrading: true,
        withWho: recipient.socketId
      };

      if (!recipient.trading.isTrading) {
        socket.to(recipient.socketId).emit(SocketEvents.OPEN_TRADE, `${sender.username} wants to trade`);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, SocketErrors.CONNECTION);
    }
  }

  @OnMessage(SocketEvents.SEND_ITEMS)
  sendItems(@ConnectedSocket() socket: Socket, @MessageBody() data: SendItemData) {
    try {
      const { items, survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const sender = this.getConnectedSocketData(socket.id);

      // check if either of sender or recipient is already on a trade
      if (recipient.trading.withWho !== socket.id) {
        return socket.emit(SocketEvents.DECLINE_EXISTING_TRADE, 'This user is already on a trade');
      }
      if (recipient.trading.isTrading && sender.trading.isTrading) {
        recipient.receivingItems = items;
        sender.sendingItems = items;

        socket.to(recipient.socketId).emit(SocketEvents.DELIVER_ITEMS, items);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, SocketErrors.CONNECTION);
    }
  }

  @OnMessage(SocketEvents.ACCEPT_TRADE)
  async acceptTrade(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    try {
      const { survivor } = data;
      const recipient = this.getConnectedUserData(survivor.id);
      const recipientIndex = this.getConnectedUserIndex(survivor.id);

      const sender = this.getConnectedSocketData(socket.id);
      const senderIndex = this.getConnectedSocketIndex(socket.id);

      if (recipient.acceptTrade) {
        const recipientUser = await this.userRepository.findOne({
          relations: ['items'],
          where: { id: recipient.userId }
        });
        const senderUser = await this.userRepository.findOne({
          relations: ['items'],
          where: { id: sender.userId }
        });

        const { items: recItems } = recipientUser;
        const { items: senItems } = senderUser;

        const {
          sendingItems: recSendingItems,
          receivingItems: recReceivingItems
        } = recipient;

        const {
          sendingItems: senSendingItems,
          receivingItems: senReceivingItems
        } = sender;

        const updateRecItems = recSendingItems.map(async (recItem) => {
          const item = recItems.find((item) => item.OSRSId === recItem.id);
          item.user = senderUser;
          await this.itemRepository.save(item);
        });

        const updateSenItems = senSendingItems.map(async (recItem) => {
          const item = senItems.find((item) => item.OSRSId === recItem.id);
          item.user = recipientUser;
          await this.itemRepository.save(item);
        });

        await Promise.all([updateRecItems, updateSenItems]);

        // needs to reset user state after trade
        this.connectedUsers.splice(recipientIndex, 1, this.resetUser(recipient));
        this.connectedUsers.splice(senderIndex, 1, this.resetUser(sender));

        socket.to(recipient.socketId).emit(SocketEvents.FINISH_TRADE, `Successful trade with ${sender.username}`);
        socket.emit(SocketEvents.FINISH_TRADE, `Successful trade with ${recipient.username}`);
        return;
      }

      sender.acceptTrade = true;
      socket.to(recipient.socketId).emit(SocketEvents.RECIPIENT_ACKNOWLEDGE);
      socket.emit(SocketEvents.SENDER_ACKNOWLEDGE);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, SocketErrors.TRADE);
    }
  }

  @OnMessage(SocketEvents.DECLINE_TRADE)
  declineTrade(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    try {
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
    } catch (error) {
      socket.emit(SocketEvents.ERROR, SocketErrors.TRADE);
    }
  }

  @OnMessage(SocketEvents.REQUEST_USER_STATUS)
  requestUserStatus(@ConnectedSocket() socket: Socket, @MessageBody() data: Partial<SendItemData>) {
    const { survivor } = data;
    const user = this.getConnectedUserIndex(survivor.id);
    socket.emit(SocketEvents.REQUEST_USER_STATUS, { status: user !== -1 });
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    const user = this.getConnectedSocketIndex(socket.id);
    if (user !== -1) this.connectedUsers.splice(user, 1);
    console.log(`disconnected : ${socket.id}`);
    console.log(this.connectedUsers);
  }
}
