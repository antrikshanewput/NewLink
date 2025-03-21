Encryption Middleware for NestJS 🚀🔒
Overview
This module implements Hybrid Encryption in a NestJS middleware, ensuring that all incoming requests are decrypted and outgoing responses are encrypted using a combination of RSA and AES encryption.

🔹 Features
✅ Hybrid Encryption (RSA + AES-256-GCM) for speed and security
✅ Seamless Middleware Integration in NestJS
✅ Automatic Encryption & Decryption of request/response payloads
✅ Prevents Recursive Encryption for multiple middleware layers
✅ Tamper-proof Authentication Tag (authTag) for AES encryption

1️⃣ Installation
First, install the required dependencies:

sh
Copy
Edit
npm install crypto
2️⃣ How It Works
🔹 Hybrid Encryption (RSA + AES) Flow
1️⃣ Client-Side Encryption

Generates a random AES key & IV (Initialization Vector)
Encrypts the data using AES-256-GCM
Encrypts the AES key using RSA Public Key
Sends { encryptedData, iv, authTag, encryptedAESKey } in the request
2️⃣ Middleware Decryption (Server-Side)

Decrypts the AES key using RSA Private Key
Uses the AES key to decrypt encryptedData
Ensures integrity using authTag
Processes the decrypted request
3️⃣ Server-Side Response Encryption

Generates a new AES key & IV
Encrypts the response with AES-256-GCM
Encrypts the AES key using RSA Public Key
Sends { encryptedData, iv, authTag, encryptedAESKey } back to the client
3️⃣ Middleware Usage
📌 Step 1: Register Middleware
In your app.module.ts, apply the middleware globally:

ts
Copy
Edit
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EncryptionMiddleware } from './encryption.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EncryptionMiddleware).forRoutes('*'); // Apply to all routes
  }
}
4️⃣ Configuration
📌 Step 2: Provide RSA Keys
Your RSA keys must be stored securely. Configure them in an environment file or pass them dynamically:

ts
Copy
Edit
{
  rsaConfig: {
    privateKey: process.env.RSA_PRIVATE_KEY,  // Keep this secret
    publicKey: process.env.RSA_PUBLIC_KEY     // Used for encryption
  }
}
5️⃣ Encryption & Decryption Logic
📌 Encrypting Data (AES + RSA)
ts
Copy
Edit
encryptData(data: string): { encryptedData: string; iv: string; authTag: string; encryptedAESKey: string } {
  const aesKey = crypto.randomBytes(32); // AES-256 key
  const iv = crypto.randomBytes(16); // IV for AES-GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const encryptedAESKey = crypto.publicEncrypt(
    {
      key: this.publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    aesKey
  );

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    encryptedAESKey: encryptedAESKey.toString('base64')
  };
}
📌 Decrypting Data (RSA + AES)
ts
Copy
Edit
decryptData(encryptedPayload: { encryptedData: string; iv: string; authTag: string; encryptedAESKey: string }): string {
  const { encryptedData, iv, authTag, encryptedAESKey } = encryptedPayload;

  const decryptedAESKey = crypto.privateDecrypt(
    {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(encryptedAESKey, 'base64')
  );

  const decipher = crypto.createDecipheriv('aes-256-gcm', decryptedAESKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
6️⃣ Example Request & Response Format
📌 Encrypted Request (Client to Server)
json
Copy
Edit
{
  "encryptedData": "mYF83Vh+...",
  "iv": "sdfu8JKo...",
  "authTag": "0gA6X9ft...",
  "encryptedAESKey": "L2mp5JTo..."
}
📌 Encrypted Response (Server to Client)
json
Copy
Edit
{
  "encryptedData": "mR4T3Dd+...",
  "iv": "Kjs73Dpd...",
  "authTag": "1qX9H2ba...",
  "encryptedAESKey": "R2nd7LPo..."
}
7️⃣ Security Best Practices ✅
🔐 Keep the RSA private key secure (never expose it in frontend or logs).
🔑 Rotate AES keys periodically to enhance security.
⚠️ Validate decrypted data before processing to avoid attacks.
📌 Store encryption logs securely to debug potential failures.
