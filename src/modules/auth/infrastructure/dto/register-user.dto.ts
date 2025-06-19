import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class RegisterUserDto
 * @description Defines the shape of data required for registering a new user.
 */
export class RegisterUserDto {
  /**
   * @property {string} name - The user's full name.
   * @decorator IsString
   */
  @IsString()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  name: string;

  /**
   * @property {string} email - The user's email address. Must be a valid email format.
   * @decorator IsString
   * @decorator IsEmail
   */
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email address (must be a valid format)',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  /**
   * @property {string} password - The user's desired password. Must meet strength requirements.
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
