import { Request, Response } from 'express';
import { Controller, Get } from '@nestjs/common';
import { Authentication } from '@newlink/authentication';

@Controller('hello')
export class TestController {
    @Get()
    @Authentication()
    getHelloWorld(req: Request, res: Response): string {
        return 'Hello World!';
    }
}