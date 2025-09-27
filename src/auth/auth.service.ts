import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const newUser = await this.userService.register(username, password);
    return newUser;
  }

  async login(username: string, password: string) {
    try {
      const user = await this.userService.findByUsername(username);

      if (!user) throw new Error('User Not Found');

      const passwordIsMatch = user.pwdHash === password;

      if (!passwordIsMatch) throw new Error('Invalid Credentials');

      const payload = { username: user.username, sub: user.id };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.log(error);
    }
  }
}
