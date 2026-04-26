const express = require('express');
const { body, param } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../../controllers/task.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks (admin gets all, user gets own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Valid task id is required')]),
  getTaskById
);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a task for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Build API docs
 *               description:
 *                 type: string
 *                 example: Write Swagger docs for all routes
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  validate([
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('description').optional().trim().escape(),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'done'])
      .withMessage('Status must be one of pending, in_progress, done')
  ]),
  createTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid task id is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').escape(),
    body('description').optional().trim().escape(),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'done'])
      .withMessage('Status must be one of pending, in_progress, done')
  ]),
  updateTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete(
  '/:id',
  validate([param('id').isUUID().withMessage('Valid task id is required')]),
  deleteTask
);

module.exports = router;
