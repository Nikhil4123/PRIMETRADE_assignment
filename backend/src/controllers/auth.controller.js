const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { signToken } = require('../utils/jwt.util');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 409, [
        { field: 'email', message: 'Email already in use' }
      ]);
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return successResponse(
      res,
      {
        token,
        user
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401, [
        { field: 'email', message: 'Invalid email or password' }
      ]);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return errorResponse(res, 'Invalid email or password', 401, [
        { field: 'password', message: 'Invalid email or password' }
      ]);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      'Login successful',
      200
    );
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile fetched successfully', 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me
};
