import express from 'express';
import * as salespersonController from '../controllers/salespersonController.js';

const router = express.Router();

router.get('/', salespersonController.getAllSalespeople);
router.post('/', salespersonController.createSalesperson);
router.get('/:id', salespersonController.getSalesperson);
router.put('/:id', salespersonController.updateSalesperson);
router.delete('/:id', salespersonController.deleteSalesperson);

export default router;