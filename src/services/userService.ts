import { UserRepository } from "../repositories/userRepository";
import { CreateUserDTO, User } from "../types/index.js";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findUser(userEmail: string): Promise<User | null> {
    return this.userRepository.findByEmail(userEmail);
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    return this.userRepository.create(userData);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
