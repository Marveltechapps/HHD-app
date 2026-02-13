import express from 'express';
import {
  createScannedItem,
  getScannedItems,
  getScannedItem,
} from '../controllers/scannedItem.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createScannedItem);
router.get('/', getScannedItems);
router.get('/:id', getScannedItem);

export default router;
