import { IsNumber, IsPositive, IsString } from 'class-validator';

export class WithdrawalDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  bankName: string;

  @IsString()
  bankAccountNumber: string;

  @IsString()
  bankAccountHolder: string;
}
