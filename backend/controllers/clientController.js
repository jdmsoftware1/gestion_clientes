import { Client, Salesperson, Sale, Payment } from '../models/index.js';
import sequelize from '../config/database.js';

// Get all clients with calculated debt
export const getAllClients = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    
    const where = salespersonId ? { salespersonId } : {};
    
    const clients = await Client.findAll({
      where,
      attributes: ['id', 'name', 'phone', 'email', 'address', 'salespersonId', 'createdAt', 'updatedAt'],
      order: [['name', 'ASC']],
      raw: true,
    });

    const result = await Promise.all(
      clients.map(async (client) => {
        const debt = await calculateClientDebt(client.id);
        const lastPaymentMonth = await getLastPaymentMonth(client.id);
        return {
          ...client,
          debt,
          lastPaymentMonth,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single client with debt
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id, {
      include: [
        { model: Salesperson, as: 'salesperson' },
        { model: Sale, as: 'sales' },
        { model: Payment, as: 'payments' },
      ],
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const debt = await calculateClientDebt(id);
    const lastPaymentMonth = await getLastPaymentMonth(id);

    res.json({
      ...client.toJSON(),
      debt,
      lastPaymentMonth,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create client
export const createClient = async (req, res) => {
  try {
    const { name, phone, email, address, salespersonId } = req.body;

    if (!name || !salespersonId) {
      return res.status(400).json({ error: 'Name and salespersonId are required' });
    }

    // Verify salesperson exists
    const salesperson = await Salesperson.findByPk(salespersonId);
    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    const client = await Client.create({
      name,
      phone,
      email,
      address,
      salespersonId,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, salespersonId } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (salespersonId) {
      const salesperson = await Salesperson.findByPk(salespersonId);
      if (!salesperson) {
        return res.status(404).json({ error: 'Salesperson not found' });
      }
    }

    await client.update({
      name,
      phone,
      email,
      address,
      salespersonId,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.destroy();
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate client debt
export async function calculateClientDebt(clientId) {
  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
    FROM clients c
    LEFT JOIN sales s ON c.id = s."clientId"
    LEFT JOIN payments p ON c.id = p."clientId"
    WHERE c.id = ?
    `,
    { replacements: [clientId], type: sequelize.QueryTypes.SELECT }
  );

  return parseFloat(result[0]?.debt) || 0;
}

// Helper function to get last payment month
export async function getLastPaymentMonth(clientId) {
  const result = await sequelize.query(
    `
    SELECT TO_CHAR(MAX("createdAt"), 'MM/YYYY') as last_month
    FROM payments
    WHERE "clientId" = ?
    `,
    { replacements: [clientId], type: sequelize.QueryTypes.SELECT }
  );

  return result[0]?.last_month || '-';
}