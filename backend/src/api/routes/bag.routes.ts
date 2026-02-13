import express from 'express';
import { scanBag, updateBag, getBag } from '../controllers/bag.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/scan', scanBag);
router.route('/:bagId').get(getBag).put(updateBag);

export default router;
