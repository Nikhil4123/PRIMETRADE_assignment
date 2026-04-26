const { User, Task } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, users, 'Users fetched successfully', 200);
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await Task.destroy({ where: { userId: id } });
    await user.destroy();

    return successResponse(res, null, 'User and related tasks deleted successfully', 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  deleteUser
};
