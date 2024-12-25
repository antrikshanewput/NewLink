import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @Inject('USER_REPOSITORY') private readonly userRepository: Repository<any>
    ) { }

    async getUserById(id: string): Promise<any> {
        const { password, ...user } = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }


    async updateUser(id: string, data: any): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.userRepository.update(id, data);
    }

}