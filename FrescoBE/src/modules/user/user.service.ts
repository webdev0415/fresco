import { Injectable, NotFoundException } from '@nestjs/common';
import { FindConditions } from 'typeorm';

import { redis } from '../../common/constants/redis';
// import { FileNotImageException } from '../../exceptions/file-not-image.exception';
// import { IFile } from '../../interfaces/IFile';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { ValidatorService } from '../../shared/services/validator.service';
import { UserLoginGoogleDto } from '../auth/dto/UserLoginGoogleDto';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UserDto } from './dto/UserDto';
import { UsersPageDto } from './dto/UsersPageDto';
import { UsersPageOptionsDto } from './dto/UsersPageOptionsDto';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        public readonly userRepository: UserRepository,
        public readonly validatorService: ValidatorService,
        public readonly awsS3Service: AwsS3Service,
    ) {}

    /**
     * Find single user
     */
    findOne(findData: FindConditions<UserEntity>): Promise<UserEntity> {
        return this.userRepository.findOne(findData);
    }
    async findByUsernameOrEmail(
        options: Partial<{ username: string; email: string }>,
    ): Promise<UserEntity | undefined> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (options.email) {
            queryBuilder.orWhere('user.email = :email', {
                email: options.email,
            });
        }
        if (options.username) {
            queryBuilder.orWhere('user.username = :username', {
                username: options.username,
            });
        }

        return queryBuilder.getOne();
    }

    async createUser(
        userRegisterDto: UserRegisterDto,
        // file: IFile,
    ): Promise<UserEntity> {
        // let avatar: string;
        // if (file && !this.validatorService.isImage(file.mimetype)) {
        //     throw new FileNotImageException();
        // }

        // if (file) {
        //     avatar = await this.awsS3Service.uploadImage(file);
        // }

        // const user = this.userRepository.create({ ...userRegisterDto, avatar });
        const user = this.userRepository.create({ ...userRegisterDto });

        return this.userRepository.save(user);
    }

    async createUserForGoogle(
        userLoginGoogleDto: UserLoginGoogleDto,
    ): Promise<UserEntity> {
        const user = this.userRepository.create({ ...userLoginGoogleDto });
        return this.userRepository.save(user);
    }

    async update(userLoginGoogleDto: UserLoginGoogleDto): Promise<UserEntity> {
        const user = this.userRepository.create({ ...userLoginGoogleDto });
        return this.userRepository.save(user);
    }

    async getUsers(pageOptionsDto: UsersPageOptionsDto): Promise<UsersPageDto> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const [users, pageMetaDto] = await queryBuilder.paginate(
            pageOptionsDto,
        );

        return new UsersPageDto(users.toDtos(), pageMetaDto);
    }

    async confirmEmail(code: string): Promise<UserDto> {
        const userId = await redis.get(code);
        if (!userId) {
            throw new NotFoundException();
        }
        await this.userRepository.update({ id: userId }, { verified: true });
        const user = await this.userRepository.findOne({ id: userId });
        return new UserDto(user);
    }
}
