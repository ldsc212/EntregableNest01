import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.gamesService.findAllByStatus(status);
    }
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @Patch(':id/join')
  joinGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.joinGame(+id, updateGameDto);
  }

  @Patch(':id/start')
  starGame(@Param('id') id: string) {
    return this.gamesService.startGame(+id)
  }

  @Patch(':id/end')
  endGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.endGame(+id, updateGameDto);
  }

  @Get(':id/players')
  getPlayers(@Param('id') id: string) {
    return this.gamesService.getPlayersByGame(+id);
  }

}
