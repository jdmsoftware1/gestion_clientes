#!/usr/bin/env python3
"""
Script para extraer TODOS los datos históricos del archivo tiendaNew(2).sql
y generar un archivo SQL completo para PostgreSQL/Neon.

Extrae:
- Todas las ventas históricas (tabla comprasb) - ~3,098 registros
- Todos los pagos históricos (tabla pagos) - ~7,849 registros

Convierte de MySQL a PostgreSQL y filtra datos anteriores a octubre 2025.
"""

import re
import os
from datetime import datetime

def extract_historical_data():
    print(">> Extrayendo TODOS los datos historicos...")
    
    # Rutas de archivos
    source_file = "../tiendaNew(2).sql"
    output_file = "historical_data_complete.sql"
    
    if not os.path.exists(source_file):
        print(f"ERROR: No se encuentra el archivo {source_file}")
        print("   Asegurate de que el archivo tiendaNew(2).sql este en la carpeta correcta")
        return
    
    # Leer archivo fuente
    print(">> Leyendo archivo tiendaNew(2).sql...")
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraer datos de ventas históricas (comprasb)
    print(">> Extrayendo ventas historicas...")
    sales_pattern = r"INSERT INTO `comprasb`.*?VALUES\s*(.*?);"
    sales_match = re.search(sales_pattern, content, re.DOTALL | re.IGNORECASE)
    
    if not sales_match:
        print("ERROR: No se encontraron datos de ventas (comprasb)")
        return
    
    sales_values = sales_match.group(1)
    
    # Extraer datos de pagos históricos
    print(">> Extrayendo pagos historicos...")
    payments_pattern = r"INSERT INTO `pagos`.*?VALUES\s*(.*?);"
    payments_matches = re.findall(payments_pattern, content, re.DOTALL | re.IGNORECASE)
    
    if not payments_matches:
        print("ERROR: No se encontraron datos de pagos")
        return
    
    # Combinar todos los pagos (hay múltiples INSERT statements)
    all_payments = []
    for match in payments_matches:
        all_payments.append(match)
    
    payments_values = ",\n".join(all_payments)
    
    # Contar registros
    sales_count = len(re.findall(r'\([^)]+\)', sales_values))
    payments_count = len(re.findall(r'\([^)]+\)', payments_values))
    
    print(f"Encontrados {sales_count:,} registros de ventas")
    print(f"Encontrados {payments_count:,} registros de pagos")
    
    # Filtrar datos anteriores a octubre 2025
    print(">> Filtrando datos anteriores a octubre 2025...")
    
    # Para ventas: filtrar fechas < 2025-10-01
    def filter_sales_by_date(values_str):
        lines = values_str.split('\n')
        filtered_lines = []
        filtered_count = 0
        
        for line in lines:
            # Buscar fechas en formato 'YYYY-MM-DD'
            date_match = re.search(r"'(\d{4}-\d{2}-\d{2})'", line)
            if date_match:
                date_str = date_match.group(1)
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    cutoff_date = datetime(2025, 10, 1)
                    
                    if date_obj < cutoff_date:
                        filtered_lines.append(line)
                        filtered_count += 1
                except ValueError:
                    # Si no se puede parsear la fecha, incluir el registro
                    filtered_lines.append(line)
            else:
                # Si no hay fecha, incluir el registro
                filtered_lines.append(line)
        
        return '\n'.join(filtered_lines), filtered_count
    
    # Filtrar ventas
    filtered_sales, sales_filtered_count = filter_sales_by_date(sales_values)
    
    # Filtrar pagos
    filtered_payments, payments_filtered_count = filter_sales_by_date(payments_values)
    
    print(f"Ventas históricas filtradas: {sales_filtered_count:,}")
    print(f"Pagos históricos filtrados: {payments_filtered_count:,}")
    
    # Convertir de MySQL a PostgreSQL
    print(">> Convirtiendo formato MySQL a PostgreSQL...")
    
    # Limpiar y formatear para PostgreSQL
    def clean_for_postgresql(values_str):
        # Remover backticks
        cleaned = values_str.replace('`', '')
        
        # Convertir nombres de columnas a minúsculas
        cleaned = re.sub(r'codCom', 'codcom', cleaned)
        cleaned = re.sub(r'codArt', 'codart', cleaned)
        cleaned = re.sub(r'codCli', 'codcli', cleaned)
        cleaned = re.sub(r'nombreCli', 'nombrecli', cleaned)
        cleaned = re.sub(r'apellidosCli', 'apellidoscli', cleaned)
        cleaned = re.sub(r'nombreArt', 'nombreart', cleaned)
        cleaned = re.sub(r'fechaCom', 'fechacom', cleaned)
        
        return cleaned
    
    cleaned_sales = clean_for_postgresql(filtered_sales)
    cleaned_payments = clean_for_postgresql(filtered_payments)
    
    # Generar archivo SQL completo
    print(">> Generando archivo SQL completo...")
    
    sql_content = f"""-- DATOS HISTORICOS COMPLETOS - Generado automaticamente
-- Fecha de generacion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- Registros de ventas: {sales_filtered_count:,}
-- Registros de pagos: {payments_filtered_count:,}

-- =====================================================================
-- VENTAS HISTORICAS COMPLETAS
-- =====================================================================

INSERT INTO historical_sales (codcom, codart, codcli, nombrecli, apellidoscli, nombreart, precio, cantidad, subtotal, total, fechacom, vista, cod_user) VALUES
{cleaned_sales};

-- =====================================================================
-- PAGOS HISTORICOS COMPLETOS
-- =====================================================================

INSERT INTO historical_payments (cod_cliente_p, nombre_c_p, apellidos_c_p, fecha_pago, tipo_de_pago, cantidad_pago, cod_pago, vista, cod_user) VALUES
{cleaned_payments};

-- =====================================================================
-- RESUMEN
-- =====================================================================
-- >> {sales_filtered_count:,} ventas historicas importadas
-- >> {payments_filtered_count:,} pagos historicos importados
-- >> Datos filtrados: anteriores a octubre 2025
-- >> Formato: PostgreSQL compatible
-- =====================================================================
"""
    
    # Guardar archivo
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f">> Completado! Archivo generado: {output_file}")
    print(f">> Tamaño del archivo: {os.path.getsize(output_file) / 1024 / 1024:.1f} MB")
    print()
    print(">> Instrucciones:")
    print("1. Ejecuta primero: create_historical_tables_complete.sql (solo tablas)")
    print("2. Luego ejecuta: historical_data_complete.sql (todos los datos)")
    print("3. O copia y pega el contenido en la consola de Neon")
    print()
    print(">> Tendras miles de registros historicos para analytics ricos!")

if __name__ == "__main__":
    extract_historical_data()
