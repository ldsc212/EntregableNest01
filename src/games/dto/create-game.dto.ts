import { IsArray, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from "class-validator";
import { Game } from "../entities/game.entity";
export enum GameState {
    WAITING = 'waiting',
    IN_PROGRESS = 'in-progress',
    FINISHED = 'finished',
}
export class CreateGameDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(2)
    maxPlayers: number;

    @IsInt()
    @IsOptional()
    userId?: number;

    @IsEnum(GameState)
    @IsOptional()
    state: GameState;

    @IsObject()
    @IsOptional()
    score: Record<string, number>;
}