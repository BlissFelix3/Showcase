import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import appConfig from '../config';

interface PaystackTransactionResponse {
  data: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

interface PaystackVerifyResponse {
  data: {
    status: string;
    amount: number;
    reference: string;
    gateway_response: string;
    paid_at: string;
    channel: string;
    currency: string;
    customer: Record<string, unknown>;
    metadata: Record<string, unknown>;
  };
}

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = appConfig.paystack.key;

  async initTransaction(email: string, amountMinor: number, reference: string) {
    try {
      const response = await axios.post<PaystackTransactionResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: amountMinor,
          reference,
          callback_url: `${appConfig.baseUrl}/payments/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        accessCode: response.data.data.access_code,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to initialize Paystack transaction: ${errorMessage}`,
      );
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const transaction = response.data.data;
      return {
        status: transaction.status,
        amount: transaction.amount,
        reference: transaction.reference,
        gateway_response: transaction.gateway_response,
        paid_at: transaction.paid_at,
        channel: transaction.channel,
        currency: transaction.currency,
        customer: transaction.customer,
        metadata: transaction.metadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to verify Paystack transaction: ${errorMessage}`);
    }
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const hash = createHash('sha512')
        .update(payload + this.secretKey)
        .digest('hex');

      return hash === signature;
    } catch {
      return false;
    }
  }
}
