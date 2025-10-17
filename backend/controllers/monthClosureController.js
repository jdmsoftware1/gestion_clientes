import { MonthClosure, Salesperson } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Obtener todos los cierres con filtros
export const getAllClosures = async (req, res) => {
  try {
    const { search, salespersonId, dateFrom, dateTo } = req.query;
    
    let where = {};
    
    // Filtro por vendedor
    if (salespersonId && salespersonId !== 'TODOS') {
      where.salespersonId = salespersonId;
    }
    
    // Filtro por búsqueda en nombre
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    // Filtro por rango de fechas
    if (dateFrom && dateTo) {
      where[Op.or] = [
        {
          dateFrom: {
            [Op.between]: [dateFrom, dateTo]
          }
        },
        {
          dateTo: {
            [Op.between]: [dateFrom, dateTo]
          }
        },
        {
          [Op.and]: [
            { dateFrom: { [Op.lte]: dateFrom } },
            { dateTo: { [Op.gte]: dateTo } }
          ]
        }
      ];
    }
    
    const closures = await MonthClosure.findAll({
      where,
      include: [
        {
          model: Salesperson,
          as: 'salesperson',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(closures);
  } catch (error) {
    console.error('Error fetching closures:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un cierre específico
export const getClosure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const closure = await MonthClosure.findByPk(id, {
      include: [
        {
          model: Salesperson,
          as: 'salesperson',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });
    
    if (!closure) {
      return res.status(404).json({ error: 'Cierre no encontrado' });
    }
    
    res.json(closure);
  } catch (error) {
    console.error('Error fetching closure:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo cierre de mes
export const createClosure = async (req, res) => {
  try {
    const { name, salespersonId, description, closedBy } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre del cierre es requerido' });
    }
    
    // Obtener el último cierre para este vendedor (o general)
    const lastClosure = await MonthClosure.findOne({
      where: salespersonId && salespersonId !== 'TODOS' 
        ? { salespersonId } 
        : { salespersonId: null },
      order: [['date_to', 'DESC']]
    });
    
    // Calcular fechas del período
    const today = new Date();
    const dateToday = today.toISOString().split('T')[0];
    
    let dateFrom;
    if (lastClosure) {
      // Si hay un cierre anterior, empezar desde el día siguiente
      const lastDate = new Date(lastClosure.dateTo);
      lastDate.setDate(lastDate.getDate() + 1);
      dateFrom = lastDate.toISOString().split('T')[0];
    } else {
      // Si es el primer cierre, empezar desde el primer día del mes actual
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    }
    
    // Calcular métricas del período
    const metrics = await calculatePeriodMetrics(dateFrom, dateToday, salespersonId);
    
    // Crear el cierre
    const closure = await MonthClosure.create({
      name,
      dateFrom,
      dateTo: dateToday,
      salespersonId: salespersonId && salespersonId !== 'TODOS' ? salespersonId : null,
      totalSales: metrics.totalSales,
      totalPayments: metrics.totalPayments,
      totalDebt: metrics.totalDebt,
      netAmount: metrics.netAmount,
      description,
      closedBy
    });
    
    // Obtener el cierre creado con las relaciones
    const createdClosure = await MonthClosure.findByPk(closure.id, {
      include: [
        {
          model: Salesperson,
          as: 'salesperson',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });
    
    res.status(201).json(createdClosure);
  } catch (error) {
    console.error('Error creating closure:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un cierre
export const updateClosure = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const closure = await MonthClosure.findByPk(id);
    if (!closure) {
      return res.status(404).json({ error: 'Cierre no encontrado' });
    }
    
    await closure.update({ name, description });
    
    const updatedClosure = await MonthClosure.findByPk(id, {
      include: [
        {
          model: Salesperson,
          as: 'salesperson',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });
    
    res.json(updatedClosure);
  } catch (error) {
    console.error('Error updating closure:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un cierre
export const deleteClosure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const closure = await MonthClosure.findByPk(id);
    if (!closure) {
      return res.status(404).json({ error: 'Cierre no encontrado' });
    }
    
    await closure.destroy();
    res.json({ message: 'Cierre eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting closure:', error);
    res.status(500).json({ error: error.message });
  }
};

// Función helper para calcular métricas del período
async function calculatePeriodMetrics(dateFrom, dateTo, salespersonId) {
  try {
    // Construir filtros
    let salespersonFilter = '';
    const replacements = { dateFrom, dateTo };
    
    if (salespersonId && salespersonId !== 'TODOS') {
      salespersonFilter = 'AND c.salesperson_id = :salespersonId';
      replacements.salespersonId = salespersonId;
    }
    
    // Calcular ventas del período
    const salesQuery = `
      SELECT COALESCE(SUM(s.amount), 0) as total_sales
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.created_at >= :dateFrom AND s.created_at <= :dateTo
      ${salespersonFilter}
    `;
    
    // Calcular pagos del período
    const paymentsQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total_payments
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.created_at >= :dateFrom AND p.created_at <= :dateTo
      ${salespersonFilter}
    `;
    
    // Calcular deuda total actual
    const debtQuery = `
      SELECT COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as total_debt
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE 1=1 ${salespersonFilter.replace('AND', 'AND')}
    `;
    
    const [salesResult, paymentsResult, debtResult] = await Promise.all([
      sequelize.query(salesQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(paymentsQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(debtQuery, { replacements, type: sequelize.QueryTypes.SELECT })
    ]);
    
    const totalSales = parseFloat(salesResult[0]?.total_sales) || 0;
    const totalPayments = parseFloat(paymentsResult[0]?.total_payments) || 0;
    const totalDebt = parseFloat(debtResult[0]?.total_debt) || 0;
    const netAmount = totalSales - totalPayments;
    
    return {
      totalSales,
      totalPayments,
      totalDebt,
      netAmount
    };
  } catch (error) {
    console.error('Error calculating period metrics:', error);
    return {
      totalSales: 0,
      totalPayments: 0,
      totalDebt: 0,
      netAmount: 0
    };
  }
}
