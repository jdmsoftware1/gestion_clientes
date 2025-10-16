import { Payment, Client, Salesperson } from '../models/index.js';

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    
    const include = [{ model: Client, as: 'client', include: [{ model: Salesperson, as: 'salesperson' }] }];

    const payments = await Payment.findAll({
      include,
      order: [['createdAt', 'DESC']],
    });

    // Filter by salesperson if specified
    const filtered = salespersonId && salespersonId !== 'TODOS'
      ? payments.filter(payment => payment.client?.salespersonId === salespersonId)
      : payments;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payments by client
export const getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const payments = await Payment.findAll({
      where: { clientId },
      include: [{ model: Client, as: 'client' }],
      order: [['createdAt', 'DESC']],
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single payment
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [{ model: Client, as: 'client' }],
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create payment
export const createPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, clientId } = req.body;

    if (!amount || !paymentMethod || !clientId) {
      return res.status(400).json({ error: 'Amount, paymentMethod, and clientId are required' });
    }

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const payment = await Payment.create({
      amount,
      paymentMethod,
      clientId,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.update({ amount, paymentMethod });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.destroy();
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};