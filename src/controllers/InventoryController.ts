import {
  Body, CurrentUser, Get, HttpError, JsonController, Param, Post, Put, UseBefore
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import * as bodyParser from 'body-parser';
import { validateItem } from '../middleware/validate';
import { User } from '../entity/User';
import { Item } from '../entity/Item';

@JsonController('/inventory')
export class InventoryController {
  private userRepository = getRepository(User)

  private itemRepository = getRepository(Item);

  @Get('/:id')
  async getUserInventory(
    @CurrentUser({ required: true }) user: User,
    @Param('id') id: string
  ) {
    const fetchUser = await this.userRepository.findOne({
      relations: ['items'],
      where: { id }
    });

    const { items } = fetchUser;

    return items;
  }

  @Post('/')
  @UseBefore(bodyParser.json(), validateItem)
  async saveItemToInventory(
    @CurrentUser({ required: true }) user: User,
    @Body() data: Record<string, any>
  ) {
    const item = this.itemRepository.create(data);
    const { items } = user;

    if (items.length >= 5) throw new HttpError(401, 'Your inventory is full');

    const existingItem = items.find((i) => i.OSRSId === item.OSRSId);
    if (existingItem) throw new HttpError(422, 'You already own that item');

    await this.itemRepository.save(item);
    user.items = [...user.items, item];
    await this.userRepository.save(user);

    return { message: 'Saved item to inventory' };
  }
}
