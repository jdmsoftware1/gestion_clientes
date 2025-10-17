import { Sale, Client, Salesperson } from '../models/index.js';

// Get all sales
export const getAllSales = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    
    const where = {};
    const include = [{ model: Client, as: 'client', include: [{ model: Salesperson, as: 'salesperson' }] }];

    const sales = await Sale.findAll({
      include,
      where,
      order: [['created_at', 'DESC']],
    });

    // Filter by salesperson if specified
    const filtered = salespersonId && salespersonId !== 'TODOS'
      ? sales.filter(sale => sale.client?.salespersonId === salespersonId)
      : sales;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sales by client
export const getSalesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const sales = await Sale.findAll({
      where: { clientId },
      include: [{ model: Client, as: 'client' }],
      order: [['created_at', 'DESC']],
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single sale
export const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, {
      include: [{ model: Client, as: 'client' }],
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create sale
export const createSale = async (req, res) => {
  try {
    const { amount, description, clientId } = req.body;

    if (!amount || !description || !clientId) {
      return res.status(400).json({ error: 'Amount, description, and clientId are required' });
    }

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const sale = await Sale.create({
      amount,
      description,
      clientId,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await sale.update({ amount, description });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete sale
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await sale.destroy();
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};