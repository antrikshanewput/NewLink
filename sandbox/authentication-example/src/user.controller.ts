import { Request, Response } from 'express';
import { Controller, Get } from '@nestjs/common';
import { Authentication } from '@newlink/authentication';
import { Role } from '@newlink/authorization';

@Controller('hello')
export class TestController {
    @Get()
    // @Role('Admin')
    @Authentication()
    getHelloWorld(req: Request, res: Response): string {
        return 'Hello World!';
    }
}