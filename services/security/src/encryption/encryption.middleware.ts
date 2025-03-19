import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { SecurityOptions } from 'interface/security-config.interface';

@Injectable()
export class EncryptionMiddleware implements NestMiddleware {
  private privateKey: string;
  private publicKey: string;

  // Store browser public keys mapped to session IDs with expiration
  private browserPublicKeys: Map<string, { key: string; timestamp: number }> = new Map();
  private EXPIRY_TIME_MS = 1 * 60 * 1000; // 15 minutes expiry
  private CLEANUP_INTERVAL_MS = 1 * 60 * 1000; // Cleanup every  minutes

  constructor(@Inject('SECURITY_OPTIONS') private readonly options: SecurityOptions) {
    this.privateKey = this.options.rsaConfig.privateKey;
    this.publicKey = this.options.rsaConfig.publicKey;

    if (!this.privateKey || !this.publicKey) {
      throw new Error('RSA keys are not configured properly.');
    }

    // Start automatic cleanup for expired keys
    setInterval(() => this.cleanupExpiredKeys(), this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Remove expired browser keys from memory.
   */
  private cleanupExpiredKeys() {
    const now = Date.now();
    this.browserPublicKeys.forEach((value, sessionId) => {
      if (now - value.timestamp > this.EXPIRY_TIME_MS) {
        this.browserPublicKeys.delete(sessionId);
        console.log(`🔹 Removed expired key for session: ${sessionId}`);
      }
    });
  }

  /**
   * Generates a random AES key (256-bit).
   */
  private generateAESKey(): Buffer {
    return crypto.randomBytes(32);
  }

  /**
   * Encrypts data using AES-256-GCM.
   */
  private aesEncrypt(data: string, key: Buffer): { encryptedData: string; iv: string; authTag: string } {
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
  private aesDecrypt(encryptedData: string, key: Buffer, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypts AES key using RSA public key.
   */
  private rsaEncryptAESKey(aesKey: Buffer, browserPublicKey: string): string {
    const encryptedKey = crypto.publicEncrypt(
      {
        key: browserPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      aesKey
    );
    return encryptedKey.toString('base64');
  }

  /**
   * Decrypts AES key using RSA private key.
   */
  private rsaDecryptAESKey(encryptedKey: string): Buffer {
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
  private encryptResponse(data: string, browserPublicKey: string): object {
    const aesKey = this.generateAESKey();
    const { encryptedData, iv, authTag } = this.aesEncrypt(data, aesKey);
    const encryptedAESKey = this.rsaEncryptAESKey(aesKey, browserPublicKey);

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
  private decryptRequest(encryptedPayload: any): string {
    const { encryptedAESKey, encryptedData, iv, authTag } = encryptedPayload;

    const aesKey = this.rsaDecryptAESKey(encryptedAESKey);
    return this.aesDecrypt(encryptedData, aesKey, iv, authTag);
  }

  /**
   * Middleware logic.
   */
  use(req: Request, res: Response, next: NextFunction) {
    console.log('🔹 Triggered Hybrid Encryption Middleware');

    const sessionId = req.headers['session-id'] as string;
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing session-id header' });
    }

    console.log(this.browserPublicKeys)
    // Store browser's public key (if provided)
    if (req.headers['browser-public-key']) {
      this.browserPublicKeys.set(sessionId, {
        key: Buffer.from(req.headers['browser-public-key'] as string, 'base64').toString(),
        timestamp: Date.now(),
      });
    }

    // Retrieve browser public key
    const browserPublicKey = this.browserPublicKeys.get(sessionId)?.key;
    if (!browserPublicKey) {
      return res.status(400).json({ message: 'Invalid or expired session. Please send your public key again.' });
    }

    // Decrypt incoming request body if encrypted
    if (req.body.encryptedAESKey) {
      try {
        const decryptedData = this.decryptRequest(req.body);
        req.body = JSON.parse(decryptedData);
      } catch (error) {
        console.error('❌ Error decrypting request:', error);
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
          const encryptedResponse = this.encryptResponse(JSON.stringify(body), browserPublicKey);
          return originalSend(encryptedResponse);
        } catch (error) {
          console.error('❌ Encryption error:', error);
          return res.status(500).json({ message: 'Encryption error' });
        }
      };
    }

    next();
  }
}
