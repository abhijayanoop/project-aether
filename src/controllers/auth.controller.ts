import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response.util';

export class AuthController {
  register = async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    ResponseUtil.success(res, result, 'User registered successfully', 201);
  };

  login = async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    ResponseUtil.success(res, result, 'Login successful');
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    ResponseUtil.success(res, result, 'Tokens refreshed successfully');
  };

  getMe = async (req: Request, res: Response) => {
    ResponseUtil.success(res, req.user, 'User retrieved successfully');
  };

  logout = async (req: Request, res: Response) => {
    ResponseUtil.success(res, null, 'User logged out successfully');
  };
}

export const authController = new AuthController();
