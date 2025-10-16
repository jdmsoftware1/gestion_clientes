import Salesperson from './Salesperson.js';
import Client from './Client.js';
import Sale from './Sale.js';
import Payment from './Payment.js';

// Asociaciones
Salesperson.hasMany(Client, { foreignKey: 'salespersonId', as: 'clients' });
Client.belongsTo(Salesperson, { foreignKey: 'salespersonId', as: 'salesperson' });

Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Client.hasMany(Payment, { foreignKey: 'clientId', as: 'payments' });
Payment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

export { Salesperson, Client, Sale, Payment };