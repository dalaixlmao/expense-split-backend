import { PrismaClient } from "@prisma/client";
import { CreateUserDTO, User } from "../types/index";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findByEmail(userEmail: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: userEmail } });
  }
  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
