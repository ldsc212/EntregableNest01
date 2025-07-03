import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GamesService {


  private readonly logger = new Logger('GamesService');

  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
  ) { }

  async create(createGameDto: CreateGameDto) {
    const { name, maxPlayers, playerName, state } = createGameDto;

    try {
      const newGame = await this.gameModel.create({
        name: name,
        maxPlayers: maxPlayers,
        players: [playerName],
        state: state || 'waiting',
        score: null,
      });

      return newGame;

    } catch (error) {
      this.handleDBException(error);

    }
  }


  async findOne(id: number) {
    const game = await this.gameModel.findOne({
      where: {
        id: id,
      },
    });
    if (!game) {
      throw new BadRequestException(`Game with id: ${id} not found`);
    }
    return game;
  }

  async joinGame(id: number, updateGameDto: UpdateGameDto) {
    const { playerName } = updateGameDto;
    const game = await this.findOne(id);

    if (game.players.includes(playerName!)) {
      throw new BadRequestException('The Player has already joined');
    }
    game.players.push(playerName!);

    try {
      await game.save();
      return {
        message: ' Joined success!',
      };
    } catch (error) {
      this.handleDBException(error);
    }

  }


  private handleDBException(error: any) {
    if (error.parent.code === '23505') {
      throw new BadRequestException(error.parent.detail);
    }

    this.logger.error(error)
    throw new InternalServerErrorException('something went wrong, check server logs!');
  }
}
