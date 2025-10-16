import express from 'express';
import * as saleController from '../controllers/saleController.js';

const router = express.Router();

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.get('/:id', saleController.getSale);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);
router.get('/client/:clientId', saleController.getSalesByClient);

export default router;