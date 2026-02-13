import express from 'express';
import { scanRack, getRack, getAvailableRacks } from '../controllers/rack.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/scan', scanRack);
router.get('/available', getAvailableRacks);
router.get('/:rackCode', getRack);

export default router;
