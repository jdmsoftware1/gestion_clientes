import express from 'express';
import {
  getAllReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn
} from '../controllers/returnController.js';

const router = express.Router();

// GET /api/returns - Get all returns for a salesperson
router.get('/', getAllReturns);

// GET /api/returns/:id - Get return by ID
router.get('/:id', getReturnById);

// POST /api/returns - Create new return
router.post('/', createReturn);

// PUT /api/returns/:id - Update return
router.put('/:id', updateReturn);

// DELETE /api/returns/:id - Delete return
router.delete('/:id', deleteReturn);

export default router;
