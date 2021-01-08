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

    const existingItem = items.find((i) => i.OSRSId === item.OSRSId);
    if (existingItem) {
      const { qtd } = existingItem;
      if ((qtd + item.qtd) > 28) throw new HttpError(422, 'You can\'t have more than 28 items of the same type');

      existingItem.qtd += item.qtd;
      await this.itemRepository.save(existingItem);
      return { message: `Incremented ${existingItem.OSRSId} quantity` };
    }

    await this.itemRepository.save(item);
    user.items = [...user.items, item];
    await this.userRepository.save(user);

    return { message: 'Saved item to inventory' };
  }
}
