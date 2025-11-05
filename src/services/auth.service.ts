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

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

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
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

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

    const newAccessToken = await generateAccessToken(
      user._id.toString(),
      user.email
    );
    const newRefreshToken = await generateRefreshToken(
      user._id.toString(),
      user.email
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
