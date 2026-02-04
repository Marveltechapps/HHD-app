import express from 'express';
import { uploadPhoto, getPhoto, verifyPhoto } from '../controllers/photo.controller';
import { protect } from '../../middleware/auth';
import { upload } from '../../services/fileUpload.service';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('photo'), uploadPhoto);
router.get('/order/:orderId/bag/:bagId', getPhoto);
router.put('/:photoId/verify', verifyPhoto);

export default router;
