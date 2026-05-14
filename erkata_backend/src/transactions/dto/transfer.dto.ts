import { IsString, IsUUID } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsUUID('4')
  toAgentId: string;
}
