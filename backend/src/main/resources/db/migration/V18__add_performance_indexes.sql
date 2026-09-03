-- Índices para mejorar el rendimiento de consultas frecuentes

-- Appointments
CREATE INDEX idx_appointments_company_id ON appointments(company_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_company_date ON appointments(company_id, appointment_date);
CREATE INDEX idx_appointments_employee_date ON appointments(employee_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Payments
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_cash_register_id ON payments(cash_register_id);

-- Expenses
CREATE INDEX idx_expenses_company_id ON expenses(company_id);
CREATE INDEX idx_expenses_cash_register_id ON expenses(cash_register_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- Cash Register
CREATE INDEX idx_cash_registers_company_id ON cash_registers(company_id);
CREATE INDEX idx_cash_registers_status ON cash_registers(status);

-- Clients
CREATE INDEX idx_clients_company_id ON clients(company_id);

-- Employees
CREATE INDEX idx_employees_company_id ON employees(company_id);

-- Catalog
CREATE INDEX idx_catalog_company_id ON catalog(company_id);

-- Invoice
CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
