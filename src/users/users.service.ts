import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Game } from 'src/games/entities/game.entity';
import *as bcrypt from 'bcrypt';
import { UserRole } from './interfaces/user-role.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    @InjectModel(Game)
    private readonly gameModel: typeof Game,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const { fullname, email, password } = createUserDto;
    try {
      const newUser = await this.userModel.create({
        fullname: fullname,
        email: email,
        password: bcrypt.hashSync(password, 12),
        rol: [UserRole.PLAYER],
        isActive: true,
      });
      return {
        message: 'User created successfully',
        user: {
          fullname: newUser.dataValues.fullname,
          email: newUser.dataValues.email,
          id: newUser.dataValues.id,
        },
      };
    } catch (error) {
      this.handleDBException(error);
    }
    return 'This action adds a new user';
  }

  async login(LoginUserDto: LoginUserDto) {
    const { email, password } = LoginUserDto;

    const user = await this.userModel.findOne({
      where: {
        email: email,
        isActive: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!bcrypt.compareSync(password, user.dataValues.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.getJwtToken({
        id: user.dataValues.id
      }),
      user: {
        id: user.dataValues.id,
        fullname: user.dataValues.fullname,
        email: user.dataValues.email,
      },
    };


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
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }


  private handleDBException(error: any) {
    if (error.parent.code === '23505') {
      throw new BadRequestException(error?.parent?.detail);
    }

    this.logger.error(error)
    throw new InternalServerErrorException('something went wrong, check server logs!');
  }
}
