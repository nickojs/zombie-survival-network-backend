import {
  Body, CurrentUser, Get, HttpError, JsonController, Param, Post, Put, UseBefore
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import * as bodyParser from 'body-parser';
import { } from '../middleware/validate';
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
}
