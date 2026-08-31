import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as twilio from 'twilio';

@Injectable()
export class OtpService {
  private twilioClient?: twilio.Twilio;

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
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    if (!this.twilioClient && !isDevelopment) {
      throw new ServiceUnavailableException('PHONE_OTP_PROVIDER_UNAVAILABLE');
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP only when there is a delivery path (or explicit development mode).
    await this.prisma.otp.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    if (this.twilioClient) {
      const twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      if (!twilioPhone) {
        throw new ServiceUnavailableException('PHONE_OTP_SENDER_UNAVAILABLE');
      }

      try {
        await this.twilioClient.messages.create({
          body: `Your Zaminat.eco verification code is: ${code}. Valid for 10 minutes.`,
          from: twilioPhone,
          to: phone,
        });
      } catch (error) {
        console.error('Failed to send SMS OTP');
        if (isDevelopment) {
          console.log(`OTP for ${phone}: ${code}`);
        }
        throw new ServiceUnavailableException('PHONE_OTP_DELIVERY_FAILED');
      }
    } else if (isDevelopment) {
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

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    return true;
  }
}
