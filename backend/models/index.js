import Salesperson from './Salesperson.js';
import Client from './Client.js';
import Sale from './Sale.js';
import Payment from './Payment.js';
import MonthClosure from './MonthClosure.js';

// Asociaciones
Salesperson.hasMany(Client, { foreignKey: 'salespersonId', as: 'clients' });
Client.belongsTo(Salesperson, { foreignKey: 'salespersonId', as: 'salesperson' });

Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Client.hasMany(Payment, { foreignKey: 'clientId', as: 'payments' });
Payment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Asociaciones para MonthClosure
Salesperson.hasMany(MonthClosure, { foreignKey: 'salespersonId', as: 'closures' });
MonthClosure.belongsTo(Salesperson, { foreignKey: 'salespersonId', as: 'salesperson' });

export { Salesperson, Client, Sale, Payment, MonthClosure };