import { Return, Client, Salesperson } from '../models/index.js';
import { transformDatesForFrontend } from '../utils/transformDates.js';

// Get all returns for a salesperson
export const getAllReturns = async (req, res) => {
  try {
    const { salespersonId } = req.query;

    if (!salespersonId) {
      return res.status(400).json({ error: 'salespersonId is required' });
    }

    const returns = await Return.findAll({
      include: [{
        model: Client,
        as: 'client',
        where: { salespersonId },
        required: true,
        include: [{ model: Salesperson, as: 'salesperson' }]
      }],
      order: [['created_at', 'DESC']]
    });

    // Transformar las fechas antes de enviar al frontend
    const transformedReturns = returns.map(returnItem => transformDatesForFrontend(returnItem.toJSON()));

    res.json(transformedReturns);
  } catch (error) {
    console.error('Error in getAllReturns:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get return by ID
export const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await Return.findByPk(id, {
      include: [{
        model: Client,
        as: 'client',
        include: [{ model: Salesperson, as: 'salesperson' }]
      }]
    });

    if (!returnItem) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Transformar las fechas antes de enviar al frontend
    const transformedReturn = transformDatesForFrontend(returnItem.toJSON());

    res.json(transformedReturn);
  } catch (error) {
    console.error('Error in getReturnById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new return
export const createReturn = async (req, res) => {
  try {
    const { amount, description, returnReason, clientId } = req.body;

    if (!amount || !description || !clientId) {
      return res.status(400).json({ error: 'Amount, description and clientId are required' });
    }

    // Verify client exists and belongs to salesperson
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const returnItem = await Return.create({
      amount: parseFloat(amount),
      description,
      returnReason: returnReason || 'Devolución de producto',
      clientId
    });

    const createdReturn = await Return.findByPk(returnItem.id, {
      include: [{
        model: Client,
        as: 'client',
        include: [{ model: Salesperson, as: 'salesperson' }]
      }]
    });

    // Transformar las fechas antes de enviar al frontend
    const transformedCreatedReturn = transformDatesForFrontend(createdReturn.toJSON());

    res.status(201).json(transformedCreatedReturn);
  } catch (error) {
    console.error('Error in createReturn:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update return
export const updateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, returnReason } = req.body;

    const returnItem = await Return.findByPk(id);
    if (!returnItem) {
      return res.status(404).json({ error: 'Return not found' });
    }

    await returnItem.update({
      amount: amount ? parseFloat(amount) : returnItem.amount,
      description: description || returnItem.description,
      returnReason: returnReason || returnItem.returnReason
    });

    const updatedReturn = await Return.findByPk(id, {
      include: [{
        model: Client,
        as: 'client',
        include: [{ model: Salesperson, as: 'salesperson' }]
      }]
    });

    // Transformar las fechas antes de enviar al frontend
    const transformedUpdatedReturn = transformDatesForFrontend(updatedReturn.toJSON());

    res.json(transformedUpdatedReturn);
  } catch (error) {
    console.error('Error in updateReturn:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete return
export const deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await Return.findByPk(id);
    if (!returnItem) {
      return res.status(404).json({ error: 'Return not found' });
    }

    await returnItem.destroy();
    res.json({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReturn:', error);
    res.status(500).json({ error: error.message });
  }
};
