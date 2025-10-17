import { Client, Salesperson, Sale, Payment } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Get all clients with calculated debt
export const getAllClients = async (req, res) => {
  try {
    const { salespersonId, search } = req.query;
    
    let where = (salespersonId && salespersonId !== 'TODOS') ? { salespersonId } : {};
    
    // Add search filter for name or internalCode
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { internalCode: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const clients = await Client.findAll({
      where,
      attributes: ['id', 'internalCode', 'name', 'phone', 'email', 'address', 'salespersonId'],
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

    // Ordenar por deuda descendente (los que más deben primero)
    result.sort((a, b) => b.debt - a.debt);

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
    const { name, phone, email, address, salespersonId, internalCode } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!salespersonId) {
      return res.status(400).json({ error: 'Salesperson is required. All clients must have a salesperson assigned.' });
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
      internalCode,
    });

    // Devolver el cliente creado con la información del vendedor
    const createdClient = await Client.findByPk(client.id, {
      include: [
        { model: Salesperson, as: 'salesperson', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json(createdClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, salespersonId, internalCode } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Validar que el cliente siempre tenga un vendedor asignado
    const finalSalespersonId = salespersonId || client.salespersonId;
    
    if (!finalSalespersonId) {
      return res.status(400).json({ error: 'Client must have a salesperson assigned' });
    }

    // Verificar que el vendedor existe
    const salesperson = await Salesperson.findByPk(finalSalespersonId);
    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    await client.update({
      name,
      phone,
      email,
      address,
      salespersonId: finalSalespersonId,
      internalCode,
    });

    // Devolver el cliente actualizado con la información del vendedor
    const updatedClient = await Client.findByPk(id, {
      include: [
        { model: Salesperson, as: 'salesperson', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updatedClient);
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
    LEFT JOIN sales s ON c.id = s.client_id
    LEFT JOIN payments p ON c.id = p.client_id
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
    SELECT TO_CHAR(MAX(created_at), 'MM/YYYY') as last_month
    FROM payments
    WHERE client_id = ?
    `,
    { replacements: [clientId], type: sequelize.QueryTypes.SELECT }
  );

  return result[0]?.last_month || '-';
}