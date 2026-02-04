import express from 'express';
import {
  getOrderItems,
  scanItem,
  markItemNotFound,
  updateItem,
} from '../controllers/item.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/order/:orderId', getOrderItems);
router.post('/scan', scanItem);
router.put('/:itemId/not-found', markItemNotFound);
router.put('/:itemId', updateItem);

export default router;
