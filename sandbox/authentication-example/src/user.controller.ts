import { Request, Response } from 'express';
import { Controller, Get } from '@nestjs/common';
import { Authentication, Feature } from '@newlink/authentication';
import { Role } from '@newlink/authentication';

@Controller('hello')
export class TestController {
    @Get()
    // @Role('Editor')
    @Feature('View Post')
    // @Authentication()
    getHelloWorld(req: Request, res: Response): string {
        return 'Hello World!';
    }
}