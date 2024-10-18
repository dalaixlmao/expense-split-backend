import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { hash } from "bcrypt";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "dotenv";
config();

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
      const newUser = await this.userService.createUser({
        email,
        mobileNumber,
        password: hashedPassword,
        name,
      });
      const token = sign({ userId: newUser.id }, process.env.JWT || "");
      const bearerToken = "Bearer " + token;
      res
        .status(200)
        .json({ message: "Signed up successfully", token: bearerToken });
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
      console.log("part1 clear", user);
      if (!user) {
      console.log("part2 clear");
        res
          .status(400)
          .json({ message: "Failed to sign in, user does not exist" });
      } else if (user) {
      console.log("part3 clear");
        const check = await compare(password, user.password);
        if (!check) {
      console.log("part4 clear", check);
          res.status(401).json({ message: "Wrong password" });
        }
        const token = sign({ userId: user?.id }, process.env.JWT_PASSWORD || "");;
        const bearerToken = "Bearer " + token;
        console.log("part5 clear", bearerToken)
        res
          .status(200)
          .json({ message: "Signed up successfully", token: bearerToken });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to sign in", error });
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
