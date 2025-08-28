import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  hash(plain: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plain, salt);
  }
}
