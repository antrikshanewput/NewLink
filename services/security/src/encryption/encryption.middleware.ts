import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { SecurityOptions } from 'interface/security-config.interface';

@Injectable()
export class EncryptionMiddleware implements NestMiddleware {
  private privateKey: string;
  private publicKey: string;

  constructor(@Inject('SECURITY_OPTIONS') private readonly options: SecurityOptions) {
    this.privateKey = this.options.rsaConfig.privateKey;
    this.publicKey = this.options.rsaConfig.publicKey;

    if (!this.privateKey || !this.publicKey) {
      throw new Error('RSA keys are not configured properly.');
    }
  }

  /**
     * Encrypts data using RSA public key.
     * Ensures data length is within RSA encryption limits.
     */
  encrypt(data: string): string {
    try {
      if (Buffer.byteLength(data, 'utf8') > 190) {
        console.warn('Data is too large for RSA encryption.');
        throw new Error('Data too large for RSA encryption.');
      }

      const buffer = Buffer.from(data, 'utf8');
      const encrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer
      );
      console.log('Encryption Successful 😎')
      return encrypted.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed.');
    }
  }

  /**
   * Decrypts data using RSA private key.
   */
  decrypt(data: string): string {
    try {
      const buffer = Buffer.from(data.trim(), 'base64'); // Ensure proper decoding
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer
      );
      console.log('Decryption Successful 🤩')
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed.');
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    console.log('Triggered Encryption Middleware');

    // Decrypt incoming request body
    if (req.body.encrypted) {
      try {
        req.body = JSON.parse(this.decrypt(req.body.encrypted));
      } catch (error) {
        console.error('Error decrypting request:', error);
        return res.status(400).json({ message: 'Invalid encrypted data' });
      }
    }

    // Prevent recursive encryption
    if (!res.locals.__ENCRYPTED__) {
      res.locals.__ENCRYPTED__ = true;

      const originalSend = res.send.bind(res);
      res.send = (body: any) => {
        if (res.locals.__ALREADY_ENCRYPTED__) {
          return originalSend(body);
        }
        res.locals.__ALREADY_ENCRYPTED__ = true;

        try {
          const responseString = JSON.stringify(body);
          const encryptedResponse = this.encrypt(responseString);
          return originalSend({ encrypted: encryptedResponse });
        } catch (error) {
          console.error('Encryption error:', error);
          return res.status(500).json({ message: 'Encryption error' });
        }
      };
    }

    next();
  }
}
