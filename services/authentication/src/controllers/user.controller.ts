import { Body, Controller, Get, Patch, Req } from "@nestjs/common";

import { Authenticate } from "decorators/authentication.decorator";

import { UserService } from "services/user.service";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get()
    @Authenticate()
    async getUser(@Req() request) {
        const { password, ...user } = request.user;
        return user;
    }

    @Patch()
    @Authenticate()
    async updateUser(@Body() data, @Req() request) {
        this.userService.updateUser(request.user.id, data);
        return this.userService.getUserById(request.user.id);
    }
}