import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { RegisterDto, LoginDto, VerifyOtpDto, RefreshTokenDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, firstName, lastName } = registerDto;

    // Check if user exists
    if (email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    if (phone) {
      const existingUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        throw new BadRequestException('User with this phone already exists');
      }
    }

    // Hash password if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        authProvider: email ? 'EMAIL' : 'PHONE',
        emailVerified: false,
        phoneVerified: phone ? false : null,
      },
    });

    // If phone registration, send OTP
    if (phone && !password) {
      await this.otpService.sendOtp(phone);
      return {
        message: 'OTP sent to your phone',
        userId: user.id,
        requiresOtp: true,
      };
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password, otp } = loginDto;

    // Find user
    let user;
    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (phone) {
      user = await this.prisma.user.findUnique({ where: { phone } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify OTP
      if (otp) {
        const isValid = await this.otpService.verifyOtp(phone, otp);
        if (!isValid) {
          throw new UnauthorizedException('Invalid OTP');
        }
        // Mark phone as verified
        await this.prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      } else {
        // Send OTP
        await this.otpService.sendOtp(phone);
        return {
          message: 'OTP sent to your phone',
          requiresOtp: true,
        };
      }
    } else {
      throw new BadRequestException('Email or phone is required');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;

    const isValid = await this.otpService.verifyOtp(phone, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Mark phone as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
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

      const tokens = await this.generateTokens(user.id);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    // Delete session
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token,
      },
    });

    return { message: 'Successfully logged out' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, phone } = resetPasswordDto;

    let user;
    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await this.prisma.user.findUnique({ where: { phone } });
    }

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the account exists, a reset link has been sent' };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email/SMS with reset link
    // For now, in development, log the token
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      console.log(`Password reset token for ${email || phone}: ${token}`);
    }

    return { message: 'If the account exists, a reset link has been sent' };
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

    // Store session
    await this.prisma.session.create({
      data: {
        userId,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

