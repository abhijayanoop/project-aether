import {
  clearFailedAttempts,
  recordFailedAttempts,
} from '../middleware/bruteForce.middleware';
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../middleware/error.middleware';
import { User } from '../models/User.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util';
import {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from '../validators/auth.validator';

export class AuthService {
  async registerUser(data: RegisterInput) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('User with this email address already exists');
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        settings: user.settings,
      },
      accessToken,
      refreshToken,
    };
  }

  async loginUser(data: LoginInput) {
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
      await recordFailedAttempts(data.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      await recordFailedAttempts(data.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    await clearFailedAttempts(data.email);

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        settings: user.settings,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findOne({ email: payload.userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newAccessToken = await generateAccessToken(user._id.toString());
    const newRefreshToken = await generateRefreshToken(user._id.toString());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
