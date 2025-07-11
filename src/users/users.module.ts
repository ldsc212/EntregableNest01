import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Game } from 'src/games/entities/game.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Game]), // <-- agrega Game aquí
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
