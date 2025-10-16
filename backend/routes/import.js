import express from 'express';
import multer from 'multer';
import * as importController from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/clients-from-csv', upload.single('file'), importController.importClientsFromCSV);

export default router;