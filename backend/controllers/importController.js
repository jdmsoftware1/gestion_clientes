import fs from 'fs';
import { parse } from 'csv-parse';
import { Salesperson, Client, Sale } from '../models/index.js';

export const importClientsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];

    // Read and parse CSV
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const records = await new Promise((resolve, reject) => {
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const data = [];
      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
          data.push(record);
        }
      });

      parser.on('error', reject);
      parser.on('end', () => resolve(data));

      parser.write(fileContent);
      parser.end();
    });

    // Process each record
    for (const record of records) {
      try {
        const { nombre_cliente, telefono_cliente, email_cliente, nombre_vendedor, deuda_inicial } = record;

        if (!nombre_cliente || !telefono_cliente || !nombre_vendedor || !deuda_inicial) {
          errors.push({
            record,
            error: 'Missing required fields',
          });
          continue;
        }

        // Find or create salesperson
        let salesperson = await Salesperson.findOne({
          where: { name: nombre_vendedor.trim() },
        });

        if (!salesperson) {
          salesperson = await Salesperson.create({
            name: nombre_vendedor.trim(),
          });
        }

        // Create client
        const client = await Client.create({
          name: nombre_cliente.trim(),
          phone: telefono_cliente.trim(),
          email: email_cliente?.trim() || null,
          salespersonId: salesperson.id,
        });

        // Create initial sale (initial debt)
        await Sale.create({
          amount: parseFloat(deuda_inicial),
          description: 'Saldo inicial migrado',
          clientId: client.id,
        });

        results.push({
          clientId: client.id,
          clientName: client.name,
          salespersonId: salesperson.id,
          salespersonName: salesperson.name,
          initialDebt: parseFloat(deuda_inicial),
        });
      } catch (error) {
        errors.push({
          record,
          error: error.message,
        });
      }
    }

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({
      message: 'Import completed',
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};