import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WebPayTransaction {
  token: string;
  url: string;
}

@Injectable()
export class WebPayService {
  private readonly serviceUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(private configService: ConfigService) {
    // URL del microservicio de pagos
    this.serviceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL') || 'http://localhost:3001';
    this.timeoutMs = Number(this.configService.get<number>('PAYMENT_SERVICE_TIMEOUT_MS')) || 5000;
    this.retries = Number(this.configService.get<number>('PAYMENT_SERVICE_RETRIES')) || 2;
  }

  private async fetchWithTimeoutAndRetries(url: string, opts: any): Promise<Response> {
    const attempt = async (retry: number): Promise<Response> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          let body: any = {};
          try { body = await res.json(); } catch (e) { /* ignore */ }
          const errMsg = body?.error || `HTTP ${res.status}`;
          throw new Error(errMsg);
        }
        return res;
      } catch (err) {
        clearTimeout(timeout);
        if (retry <= 0) throw err;
        const backoff = Math.pow(2, this.retries - retry) * 100 + Math.random() * 100;
        await new Promise(r => setTimeout(r, backoff));
        return attempt(retry - 1);
      }
    };

    return attempt(this.retries);
  }

  async createTransaction(
    amount: number,
    buyOrder: string,
    sessionId: string,
    returnUrl: string,
  ): Promise<WebPayTransaction> {
    try {
      const response = await this.fetchWithTimeoutAndRetries(`${this.serviceUrl}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, buyOrder, sessionId, returnUrl }),
      });

      const data = await response.json();
      return {
        token: data.token,
        url: data.url,
      };
    } catch (error) {
      console.error('WebPay createTransaction error:', error);
      throw new Error(`Error creating WebPay transaction: ${error.message}`);
    }
  }

  async confirmTransaction(token: string): Promise<any> {
    try {
      const response = await this.fetchWithTimeoutAndRetries(`${this.serviceUrl}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      return await response.json();
    } catch (error) {
      console.error('WebPay confirmTransaction error:', error);
      throw new Error(`Error confirming WebPay transaction: ${error.message}`);
    }
  }

  async getTransactionStatus(token: string): Promise<any> {
    try {
      const response = await this.fetchWithTimeoutAndRetries(`${this.serviceUrl}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      return await response.json();
    } catch (error) {
      console.error('WebPay getTransactionStatus error:', error);
      throw new Error(
        `Error getting WebPay transaction status: ${error.message}`,
      );
    }
  }

  async refundTransaction(token: string, amount: number): Promise<any> {
    try {
      const response = await this.fetchWithTimeoutAndRetries(`${this.serviceUrl}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('WebPay refundTransaction error:', error);
      throw new Error(`Error refunding WebPay transaction: ${error.message}`);
    }
  }
}
