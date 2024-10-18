import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserDTO } from "../types/index";
import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken"

export class UserController {
  constructor(private userService: UserService) {}

  async signUp(req: Request, res: Response) {
    try {
      const { email, mobileNumber, password, name } = req.body;
      const user = await this.userService.findUser(email);
      if (user) {
        res
          .status(400)
          .json({ message: "Failed to sign up as user already exist" });
      }
      const hashedPassword = await hash(password, 10);
      const newUser = await this.userService.createUser({email, mobileNumber, password:hashedPassword, name});
      const token = sign({userId: newUser.id}, process.env.JWT || "");
      const bearerToken = "Bearer "+token;
      res.status(200).json({message:"Signed up successfully", token:bearerToken});

    } catch (error) {
      res
          .status(400)
          .json({ message: "Failed to sign up as user already exist", error });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.findUser(email);
      if (!user) {
        res
          .status(400)
          .json({ message: "Failed to sign in, user does not exist" });
      }
      const hashedPassword = await hash(password, 10);
      if(user?.password != hashedPassword)
      {
        res.status(401).json({message: "Wrong password"});
      }
      const token = sign({userId: user?.id}, process.env.JWT || "");
      const bearerToken = "Bearer "+token;
      res.status(200).json({message:"Signed up successfully", token:bearerToken});
      
    } catch (error) {
      res
          .status(400)
          .json({ message: "Failed to sign in", error });
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ message: "User not found", error });
    }
  }
}
