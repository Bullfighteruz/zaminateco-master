import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as twilio from 'twilio';

@Injectable()
export class OtpService {
  private twilioClient: twilio.Twilio;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async sendOtp(phone: string): Promise<void> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await this.prisma.otp.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // Send SMS via Twilio (if configured)
    if (this.twilioClient) {
      const twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      try {
        await this.twilioClient.messages.create({
          body: `Your Zaminat.eco verification code is: ${code}. Valid for 10 minutes.`,
          from: twilioPhone,
          to: phone,
        });
      } catch (error) {
        console.error('Failed to send SMS:', error);
        // In development, log the OTP
        if (this.configService.get<string>('NODE_ENV') === 'development') {
          console.log(`OTP for ${phone}: ${code}`);
        }
      }
    } else {
      // Development mode: log OTP
      console.log(`OTP for ${phone}: ${code}`);
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        phone,
        code,
        expiresAt: {
          gt: new Date(),
        },
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return false;
    }

    // Mark as verified
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    return true;
  }
}

