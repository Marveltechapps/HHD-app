import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByStatus,
  getAssignOrdersByStatus,
  updateAssignOrderStatus,
} from '../controllers/order.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getOrders).post(createOrder);
router.get('/status/:status', getOrdersByStatus);
router.get('/assignorders/status/:status', getAssignOrdersByStatus);
router.put('/assignorders/:orderId/status', updateAssignOrderStatus);
router.route('/:orderId').get(getOrder);
router.put('/:orderId/status', updateOrderStatus);

export default router;
