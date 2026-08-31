import { Injectable, UnauthorizedException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, VerifyOtpDto, RefreshTokenDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, firstName, lastName } = registerDto;

    if (!email && phone) {
      throw new ServiceUnavailableException('PHONE_AUTH_NOT_CONFIGURED');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!password) {
      throw new BadRequestException('Password is required for email registration');
    }

    const existingEmailUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmailUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (phone) {
      const existingPhoneUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingPhoneUser) {
        throw new BadRequestException('User with this phone already exists');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        authProvider: 'EMAIL',
        emailVerified: false,
        phoneVerified: false,
      },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    if (phone && !email) {
      throw new ServiceUnavailableException('PHONE_AUTH_NOT_CONFIGURED');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyOtp(_verifyOtpDto: VerifyOtpDto) {
    throw new ServiceUnavailableException('PHONE_AUTH_NOT_CONFIGURED');
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token,
      },
    });

    return { message: 'Successfully logged out' };
  }

  async resetPassword(_resetPasswordDto: ResetPasswordDto) {
    throw new ServiceUnavailableException('PASSWORD_RESET_DELIVERY_NOT_CONFIGURED');
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            community: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        settings: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.usersService.sanitizeUser(user);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    await this.prisma.session.create({
      data: {
        userId,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
