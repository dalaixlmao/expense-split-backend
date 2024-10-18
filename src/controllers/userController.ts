import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserDTO } from '../types/index';

export class UserController {
  constructor(private userService: UserService) {}

  async signUp(req: Request, res: Response){
    try{
      const {email, mobileNumber, password, name} = req.body;
      

    } catch(error){

    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user', error });
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ message: 'User not found', error });
    }
  }
}