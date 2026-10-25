// Invoice storage utilities using localStorage

const INVOICES_KEY = 'stepping_soles_invoices';
const COUNTER_KEY = 'stepping_soles_invoice_counter';

export function updateInvoiceCounter(invNumStr) {
  const match = invNumStr.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    localStorage.setItem(COUNTER_KEY, num.toString());
  }
}

export function getNextInvoiceNumber() {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10) + 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return `INV-${String(counter).padStart(4, '0')}`;
}

export function peekNextInvoiceNumber() {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10) + 1;
  return `INV-${String(counter).padStart(4, '0')}`;
}

export function saveInvoice(invoiceData) {
  const invoices = getInvoices();
  invoices.push({
    ...invoiceData,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function getInvoices() {
  try {
    return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getInvoiceById(id) {
  return getInvoices().find((inv) => inv.id === id) || null;
}

export function deleteInvoice(id) {
  const invoices = getInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}
