import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { MongoService } from '@newput-newlink/database';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
	private dbType: 'postgres' | 'mongodb';
	private userModel: string = 'User';

	constructor(
		@Optional() @Inject('USER_REPOSITORY') private readonly userRepository?: Repository<any>,
		@Optional() private readonly mongoService?: MongoService,
	) {
		// Determine which database type to use based on available services
		this.dbType = this.mongoService ? 'mongodb' : 'postgres';
	}

	async getUserById(id: string): Promise<any> {
		let user;

		if (this.dbType === 'postgres' && this.userRepository) {
			user = await this.userRepository.findOne({ where: { id } });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			user = await this.mongoService.findById(this.userModel, id);
		}

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// Remove password from the returned user object
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async updateUser(id: string, data: any): Promise<any> {
		// First check if the user exists
		let userExists = false;

		if (this.dbType === 'postgres' && this.userRepository) {
			const user = await this.userRepository.findOne({ where: { id } });
			userExists = !!user;
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			const user = await this.mongoService.findById(this.userModel, id);
			userExists = !!user;
		}

		if (!userExists) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// Then update the user
		if (this.dbType === 'postgres' && this.userRepository) {
			return this.userRepository.update(id, data);
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			return this.mongoService.updateOne(this.userModel, { _id: id }, { $set: data });
		}
	}
}
