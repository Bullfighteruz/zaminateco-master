import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export enum PaymentProvider {
  PAYME = 'PAYME',
  CLICK = 'CLICK',
  STRIPE = 'STRIPE',
  ECO_COINS = 'ECO_COINS',
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  /**
   * Process payment via Payme
   */
  async processPaymePayment(orderId: string, amount: number, currency: string) {
    const paymeMerchantId = this.configService.get<string>('PAYME_MERCHANT_ID');
    const paymeKey = this.configService.get<string>('PAYME_KEY');

    // Create payment request
    const paymentData = {
      method: 'cards.create',
      params: {
        amount: amount * 100, // Convert to tiyin
        currency: currency === 'UZS' ? '860' : '840',
        order_id: orderId,
      },
    };

    // Generate checksum
    const checksum = this.generatePaymeChecksum(paymentData, paymeKey);

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://checkout.paycom.uz/api', {
          ...paymentData,
          checksum,
        }),
      );

      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          currency,
          provider: PaymentProvider.PAYME,
          transactionId: response.data.result?.transaction_id,
          status: 'PENDING',
          metadata: response.data,
        },
      });

      return payment;
    } catch (error) {
      throw new BadRequestException('Payment processing failed');
    }
  }

  /**
   * Process payment via Click
   */
  async processClickPayment(orderId: string, amount: number, currency: string) {
    const clickMerchantId = this.configService.get<string>('CLICK_MERCHANT_ID');
    const clickServiceId = this.configService.get<string>('CLICK_SERVICE_ID');
    const clickSecretKey = this.configService.get<string>('CLICK_SECRET_KEY');

    const paymentData = {
      merchant_trans_id: orderId,
      service_id: clickServiceId,
      amount: amount,
      currency: currency === 'UZS' ? '860' : '840',
    };

    // Generate sign string
    const signString = `${clickMerchantId}${paymentData.service_id}${paymentData.merchant_trans_id}${paymentData.amount}${paymentData.currency}${clickSecretKey}`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://api.click.uz/v2/merchant/payment', {
          ...paymentData,
          sign,
        }),
      );

      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          currency,
          provider: PaymentProvider.CLICK,
          transactionId: response.data?.payment_id?.toString(),
          status: 'PENDING',
          metadata: response.data,
        },
      });

      return payment;
    } catch (error) {
      throw new BadRequestException('Payment processing failed');
    }
  }

  /**
   * Process payment via Stripe
   */
  async processStripePayment(orderId: string, amount: number, currency: string, token: string) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.stripe.com/v1/charges',
          {
            amount: amount * 100, // Convert to cents
            currency: currency.toLowerCase(),
            source: token,
            description: `Order ${orderId}`,
          },
          {
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
            },
          },
        ),
      );

      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          currency,
          provider: PaymentProvider.STRIPE,
          transactionId: response.data.id,
          status: response.data.paid ? 'SUCCESS' : 'FAILED',
          metadata: response.data,
        },
      });

      return payment;
    } catch (error) {
      throw new BadRequestException('Payment processing failed');
    }
  }

  /**
   * Process payment with eco-coins
   */
  async processEcoCoinsPayment(orderId: string, amount: number, userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Convert amount to eco-coins (assuming 1 coin = 1000 UZS)
    const coinsRequired = Math.ceil(amount / 1000);

    if (profile.ecoCoins < coinsRequired) {
      throw new BadRequestException('Insufficient eco-coins');
    }

    // Deduct eco-coins
    await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ecoCoins: {
          decrement: coinsRequired,
        },
      },
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency: 'ECO_COINS',
        provider: PaymentProvider.ECO_COINS,
        transactionId: `eco_${Date.now()}`,
        status: 'SUCCESS',
        metadata: {
          coinsUsed: coinsRequired,
        },
      },
    });

    return payment;
  }

  /**
   * Verify webhook signature (Payme)
   */
  async verifyPaymeWebhook(data: any, signature: string): Promise<boolean> {
    const paymeKey = this.configService.get<string>('PAYME_KEY');
    const expectedSignature = this.generatePaymeChecksum(data, paymeKey);
    return signature === expectedSignature;
  }

  /**
   * Verify webhook signature (Click)
   */
  async verifyClickWebhook(data: any, sign: string): Promise<boolean> {
    const clickSecretKey = this.configService.get<string>('CLICK_SECRET_KEY');
    const signString = `${data.merchant_trans_id}${data.merchant_prepare_id}${data.amount}${data.action}${data.sign_time}${clickSecretKey}`;
    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');
    return sign === expectedSign;
  }

  /**
   * Handle payment webhook
   */
  async handleWebhook(provider: PaymentProvider, data: any, signature: string) {
    let isValid = false;

    switch (provider) {
      case PaymentProvider.PAYME:
        isValid = await this.verifyPaymeWebhook(data, signature);
        break;
      case PaymentProvider.CLICK:
        isValid = await this.verifyClickWebhook(data, data.sign);
        break;
      case PaymentProvider.STRIPE:
        // Stripe webhook verification is different
        isValid = true; // TODO: Implement Stripe webhook verification
        break;
    }

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Update payment status
    const transactionId = data.transaction_id || data.payment_id || data.id;
    const payment = await this.prisma.payment.findFirst({
      where: {
        transactionId,
        provider: provider as any,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Determine status from webhook data
    let status = 'PENDING';
    if (data.status === 'paid' || data.state === 2 || data.paid) {
      status = 'SUCCESS';
    } else if (data.status === 'failed' || data.state === -1 || data.failed) {
      status = 'FAILED';
    }

    // Update payment
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status as any,
        metadata: data,
      },
    });

    // Update order status if payment successful
    if (status === 'SUCCESS' && payment.orderId) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'SUCCESS',
        },
      });
    }

    return { success: true };
  }

  private generatePaymeChecksum(data: any, key: string): string {
    const dataString = JSON.stringify(data);
    return crypto.createHmac('sha256', key).update(dataString).digest('hex');
  }
}

