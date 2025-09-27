import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(username: string, password: string) {
    // const pwdHash = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) throw new Error('Username Already Existed');

    const newUser = this.userRepository.create({
      username,
      pwdHash: password,
    });

    return this.userRepository.save(newUser);
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
}
