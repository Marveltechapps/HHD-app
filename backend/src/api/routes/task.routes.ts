import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:taskId').put(updateTask).delete(deleteTask);

export default router;
