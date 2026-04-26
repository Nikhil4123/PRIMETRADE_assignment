const { Task, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const canAccessTask = (task, user) => {
  return user.role === 'admin' || task.userId === user.id;
};

const getTasks = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { where: { userId: req.user.id } };

    const tasks = await Task.findAll({
      ...query,
      include: req.user.role === 'admin' ? [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }] : [],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, tasks, 'Tasks fetched successfully', 200);
  } catch (error) {
    return next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: req.user.role === 'admin' ? [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }] : []
    });

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    if (!canAccessTask(task, req.user)) {
      return errorResponse(res, 'Forbidden: cannot access this task', 403);
    }

    return successResponse(res, task, 'Task fetched successfully', 200);
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : null,
      status: req.body.status || 'pending',
      userId: req.user.id
    });

    return successResponse(res, task, 'Task created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    if (!canAccessTask(task, req.user)) {
      return errorResponse(res, 'Forbidden: cannot update this task', 403);
    }

    const updates = {
      title: req.body.title === undefined ? task.title : req.body.title.trim(),
      description: req.body.description === undefined ? task.description : req.body.description.trim(),
      status: req.body.status === undefined ? task.status : req.body.status
    };

    await task.update(updates);

    return successResponse(res, task, 'Task updated successfully', 200);
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    if (!canAccessTask(task, req.user)) {
      return errorResponse(res, 'Forbidden: cannot delete this task', 403);
    }

    await task.destroy();

    return successResponse(res, null, 'Task deleted successfully', 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
