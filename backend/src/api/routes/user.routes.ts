import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/profile').get(getProfile).put(updateProfile);

export default router;
