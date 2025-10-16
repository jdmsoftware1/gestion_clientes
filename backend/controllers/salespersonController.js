import { Salesperson, Client, Sale, Payment } from '../models/index.js';
import sequelize from '../config/database.js';

// Get all salespeople with their total debt
export const getAllSalespeople = async (req, res) => {
  try {
    const salespeople = await Salesperson.findAll({
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      order: [['name', 'ASC']],
    });

    res.json(salespeople);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single salesperson with details
export const getSalesperson = async (req, res) => {
  try {
    const { id } = req.params;
    const salesperson = await Salesperson.findByPk(id, {
      include: [{ model: Client, as: 'clients' }],
    });

    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    const totalDebt = await calculateSalespersonDebt(id);

    res.json({
      ...salesperson.toJSON(),
      totalDebt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create salesperson
export const createSalesperson = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const salesperson = await Salesperson.create({ name, email });
    res.status(201).json(salesperson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update salesperson
export const updateSalesperson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const salesperson = await Salesperson.findByPk(id);
    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    await salesperson.update({ name, email });
    res.json(salesperson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete salesperson
export const deleteSalesperson = async (req, res) => {
  try {
    const { id } = req.params;
    const salesperson = await Salesperson.findByPk(id);
    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    await salesperson.destroy();
    res.json({ message: 'Salesperson deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate total debt for a salesperson
async function calculateSalespersonDebt(salespersonId) {
  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
    FROM clients c
    LEFT JOIN sales s ON c.id = s."clientId"
    LEFT JOIN payments p ON c.id = p."clientId"
    WHERE c."salespersonId" = $1
    `,
    { replacements: [salespersonId], type: sequelize.QueryTypes.SELECT }
  );

  return parseFloat(result[0].debt) || 0;
}