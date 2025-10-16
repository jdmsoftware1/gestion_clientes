import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.get('/client/:clientId', paymentController.getPaymentsByClient);

export default router;