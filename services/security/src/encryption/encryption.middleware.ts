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
   * Generates a random AES key.
   */
  generateAESKey(): Buffer {
    return crypto.randomBytes(32); // 256-bit key
  }

  /**
   * Encrypts data using AES-256-GCM.
   */
  aesEncrypt(data: string, key: Buffer): { encryptedData: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16); // 128-bit IV
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return {
      encryptedData: encrypted,
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
    };
  }

  /**
   * Decrypts data using AES-256-GCM.
   */
  aesDecrypt(encryptedData: string, key: Buffer, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypts AES key using RSA public key.
   */
  rsaEncryptAESKey(aesKey: Buffer): string {
    const encryptedKey = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      aesKey
    );
    return encryptedKey.toString('base64');
  }

  /**
   * Decrypts AES key using RSA private key.
   */
  rsaDecryptAESKey(encryptedKey: string): Buffer {
    const decryptedKey = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedKey, 'base64')
    );
    return decryptedKey;
  }

  /**
   * Encrypts response using hybrid encryption.
   */
  encryptResponse(data: string): object {
    const aesKey = this.generateAESKey();
    const { encryptedData, iv, authTag } = this.aesEncrypt(data, aesKey);
    const encryptedAESKey = this.rsaEncryptAESKey(aesKey);

    return {
      encryptedAESKey,
      encryptedData,
      iv,
      authTag,
    };
  }

  /**
   * Decrypts incoming request data using hybrid encryption.
   */
  decryptRequest(encryptedPayload: any): string {
    const { encryptedAESKey, encryptedData, iv, authTag } = encryptedPayload;

    const aesKey = this.rsaDecryptAESKey(encryptedAESKey);
    return this.aesDecrypt(encryptedData, aesKey, iv, authTag);
  }

  /**
   * Middleware logic.
   */
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Triggered Hybrid Encryption Middleware');

    // Decrypt incoming request body if encrypted
    if (req.body.encryptedAESKey) {
      try {
        const decryptedData = this.decryptRequest(req.body);
        req.body = JSON.parse(decryptedData);
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
          const encryptedResponse = this.encryptResponse(JSON.stringify(body));
          return originalSend(encryptedResponse);
        } catch (error) {
          console.error('Encryption error:', error);
          return res.status(500).json({ message: 'Encryption error' });
        }
      };
    }

    next();
  }
}
