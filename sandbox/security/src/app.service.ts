import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getQueryData(query?: any): any {
    console.log(`Query Params: ${JSON.stringify(query)}`);
    return { message: 'Hello World!' };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getBodyData(_body?: any): any {
    return {
      username: "<script>alert('XSS Attack!')</script>",
      password: "' OR '1'='1'; --",
      details: {
        bio: "Hello <img src=x onerror=alert('XSS!')>",
        query:
          "SELECT * FROM users WHERE email = 'admin@example.com'; DROP TABLE users; --",
      },
    };
  }
}
