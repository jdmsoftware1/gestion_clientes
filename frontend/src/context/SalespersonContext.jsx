import React, { createContext, useState, useContext, useEffect } from 'react';
import { salespeopleAPI } from '../api/services';

const SalespersonContext = createContext();

export const SalespersonProvider = ({ children }) => {
  const [salespeople, setSalespeople] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar vendedores al montar
  useEffect(() => {
    fetchSalespeople();
  }, []);

  // Si hay vendedores y ninguno seleccionado, seleccionar "TODOS"
  useEffect(() => {
    if (salespeople.length > 0 && !selectedSalesperson) {
      const saved = localStorage.getItem('selectedSalesperson');
      const todosVendedor = { id: 'TODOS', name: '🌍 TODOS' };
      
      if (saved && saved !== 'TODOS') {
        const found = salespeople.find(s => s.id === saved);
        if (found) {
          setSelectedSalesperson(found);
        } else {
          setSelectedSalesperson(todosVendedor);
        }
      } else {
        setSelectedSalesperson(todosVendedor);
      }
    }
  }, [salespeople]);

  const fetchSalespeople = async () => {
    try {
      setLoading(true);
      const response = await salespeopleAPI.getAll();
      setSalespeople(response.data);
    } catch (err) {
      console.error('Error fetching salespeople:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeSalesperson = (salesperson) => {
    setSelectedSalesperson(salesperson);
    localStorage.setItem('selectedSalesperson', salesperson.id);
  };

  // Agregar "TODOS" al inicio de la lista
  const salespeopleWithAll = [
    { id: 'TODOS', name: '🌍 TODOS' },
    ...salespeople,
  ];

  return (
    <SalespersonContext.Provider
      value={{
        salespeople: salespeopleWithAll,
        selectedSalesperson,
        changeSalesperson,
        loading,
        refetch: fetchSalespeople,
      }}
    >
      {children}
    </SalespersonContext.Provider>
  );
};

export const useSalesperson = () => {
  const context = useContext(SalespersonContext);
  if (!context) {
    throw new Error('useSalesperson debe usarse dentro de SalespersonProvider');
  }
  return context;
};