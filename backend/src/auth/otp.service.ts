import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class OtpService {
  async sendOtp(_phone: string): Promise<void> {
    throw new ServiceUnavailableException('PHONE_AUTH_NOT_CONFIGURED');
  }

  async verifyOtp(_phone: string, _code: string): Promise<boolean> {
    throw new ServiceUnavailableException('PHONE_AUTH_NOT_CONFIGURED');
  }
}
