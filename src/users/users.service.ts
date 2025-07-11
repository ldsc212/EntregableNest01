import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Game } from 'src/games/entities/game.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Game)
    private readonly gameModel: typeof Game,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const { fullname, email } = createUserDto;
    try {
      const newUser = await this.userModel.create({
        fullname: fullname,
        email: email,
        isActive: true,
      });
      return newUser;
    } catch (error) {
      this.handleDBException(error);
    }
    return 'This action adds a new user';
  }

  async findAll() {
    const users = await this.userModel.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: Game,
          through: {
            attributes: [],
          },
        }
      ]
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.userModel.findOne({
      where: {
        id: id,
      },
    })
    if (!user) {
      throw new BadRequestException(`User with id: ${id} not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getPlayersByGame(gameId: number) {
    const game = await this.gameModel.findOne({
      where: { id: gameId },
      include: [
        {
          model: User,
          as: 'players',
          attributes: ['id', 'fullname', 'email'],
          through: { attributes: [] },
        },
      ],
    });
    if (!game) {
      throw new BadRequestException(`Game with id ${gameId} not found`);
    }
    return game.players;
  }

  private handleDBException(error: any) {
    if (error.parent.code === '23505') {
      throw new BadRequestException(error?.parent?.detail);
    }

    this.logger.error(error)
    throw new InternalServerErrorException('something went wrong, check server logs!');
  }
}
