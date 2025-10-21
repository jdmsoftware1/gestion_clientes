// Función para exportar datos a CSV
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  let csvContent = '';

  // Si se proporcionan headers personalizados, úsalos
  if (headers && headers.length > 0) {
    csvContent += headers.join(',') + '\n';
  } else {
    // Usar las keys del primer objeto como headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\n';
  }

  // Agregar filas de datos
  data.forEach(row => {
    const values = headers ? headers.map(header => {
      // Si header contiene un punto, es una propiedad anidada (ej: client.name)
      if (header.includes('.')) {
        const parts = header.split('.');
        let value = row;
        parts.forEach(part => {
          value = value ? value[part] : '';
        });
        return value || '';
      } else {
        return row[header] || '';
      }
    }) : Object.values(row);

    // Escapar comillas y envolver en comillas si contiene comas o comillas
    const escapedValues = values.map(value => {
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
      }
      return stringValue;
    });

    csvContent += escapedValues.join(',') + '\n';
  });

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Función específica para exportar clientes
export const exportClientsToCSV = (clients) => {
  const headers = [
    'id',
    'internalCode',
    'name',
    'phone',
    'address',
    'debt',
    'lastPaymentMonth',
    'salesperson.name',
    'createdAt',
    'updatedAt'
  ];

  const filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(clients, filename, headers);
};

// Función específica para exportar ventas
export const exportSalesToCSV = (sales) => {
  const headers = [
    'id',
    'amount',
    'description',
    'client.name',
    'client.internalCode',
    'createdAt',
    'updatedAt'
  ];

  const filename = `ventas_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(sales, filename, headers);
};

// Función específica para exportar pagos
export const exportPaymentsToCSV = (payments) => {
  const headers = [
    'id',
    'amount',
    'paymentMethod',
    'client.name',
    'client.internalCode',
    'createdAt',
    'updatedAt'
  ];

  const filename = `pagos_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(payments, filename, headers);
};

// Función específica para exportar devoluciones
export const exportReturnsToCSV = (returns) => {
  const headers = [
    'id',
    'amount',
    'description',
    'returnReason',
    'client.name',
    'client.internalCode',
    'createdAt',
    'updatedAt'
  ];

  const filename = `devoluciones_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(returns, filename, headers);
};
