import express from 'express';
import { reportIssue } from '../controllers/pick.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/report-issue', reportIssue);

export default router;
