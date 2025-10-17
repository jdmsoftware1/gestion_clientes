import express from 'express';
import {
  getAllClosures,
  getClosure,
  createClosure,
  updateClosure,
  deleteClosure
} from '../controllers/monthClosureController.js';

const router = express.Router();

// GET /api/month-closures - Obtener todos los cierres con filtros
router.get('/', getAllClosures);

// GET /api/month-closures/:id - Obtener un cierre específico
router.get('/:id', getClosure);

// POST /api/month-closures - Crear un nuevo cierre
router.post('/', createClosure);

// PUT /api/month-closures/:id - Actualizar un cierre
router.put('/:id', updateClosure);

// DELETE /api/month-closures/:id - Eliminar un cierre
router.delete('/:id', deleteClosure);

export default router;
