import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class LoginUserDto
 * @description Defines the shape of data required for logging in a user.
 */
export class LoginUserDto {
  /**
   * @property {string} email - The user's email address used for login.
   * @decorator IsString
   * @decorator IsEmail
   */
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  /**
   * @property {string} password - The user's password used for login.
   * @decorator IsString
   * @decorator IsStrongPassword
   */
  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description:
      'User password (must meet security requirements)',
    example: 'P@ssw0rd123!',
    required: true,
    format: 'password',
  })
  password: string;
}
