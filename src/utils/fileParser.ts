import * as XLSX from 'xlsx';
import { Transaction, DatasetValidationResult } from '../types';
import { calculateDynamicBaseline } from './rulesEngine';

interface RawRow {
  [key: string]: any;
}

/**
 * Normalizes raw row data from CSV/Excel/JSON into structured Transaction items
 */
export function normalizeTransactionRow(row: RawRow, index: number): Transaction | null {
  if (!row || typeof row !== 'object') return null;

  // Find id or fallback to 1-indexed number
  const rawId = row.id || row.Id || row.ID || row['Transaction ID'] || row['tx_id'] || index + 1;
  const id = Number(rawId) || index + 1;

  // Find date
  const rawDate =
    row.date ||
    row.Date ||
    row['Transaction Date'] ||
    row['timestamp'] ||
    row['Timestamp'] ||
    row['time'] ||
    new Date().toISOString().split('T')[0];
  const date = String(rawDate).trim();

  // Find amount
  const rawAmount =
    row.amount !== undefined
      ? row.amount
      : row.Amount !== undefined
      ? row.Amount
      : row['Transaction Amount'] !== undefined
      ? row['Transaction Amount']
      : row['value'] !== undefined
      ? row['value']
      : 0;

  // Clean currency symbols, commas, spaces
  const cleanedAmountStr = String(rawAmount).replace(/[$,\s]/g, '');
  const amount = Math.abs(parseFloat(cleanedAmountStr)) || 0;

  // Find payee / merchant / beneficiary
  const rawPayee =
    row.payee ||
    row.Payee ||
    row.merchant ||
    row.Merchant ||
    row.beneficiary ||
    row.Beneficiary ||
    row.recipient ||
    row.Recipient ||
    row['Payee Name'] ||
    row['Merchant Name'] ||
    'Unknown Entity';
  const payee = String(rawPayee).trim();

  // Find channel
  const rawChannel = String(row.channel || row.Channel || row.type || row.Type || 'online').toLowerCase();
  let channel: 'online' | 'transfer' | 'debit_card' = 'online';
  if (rawChannel.includes('debit') || rawChannel.includes('pos') || rawChannel.includes('card')) {
    channel = 'debit_card';
  } else if (rawChannel.includes('wire') || rawChannel.includes('transfer') || rawChannel.includes('ach')) {
    channel = 'transfer';
  } else {
    channel = 'online';
  }

  // Find description / category
  const rawDesc =
    row.description ||
    row.Description ||
    row.category ||
    row.Category ||
    row.memo ||
    row.Memo ||
    'General Transaction';
  const description = String(rawDesc).trim();

  // Find notes & timeNotes
  const rawNotes = row.notes || row.Notes || row.memo || row.Memo || '';
  const rawTimeNote = row.timeNote || row.time_note || row['Time Note'] || row['time'] || row['Time'] || '';
  const isNewPayee = Boolean(
    row.isNewPayee ||
    row.is_new_payee ||
    row['New Payee'] ||
    String(rawNotes).toLowerCase().includes('new payee') ||
    String(rawPayee).toLowerCase().includes('new')
  );

  return {
    id,
    date,
    amount,
    payee,
    channel,
    description,
    notes: rawNotes ? String(rawNotes) : undefined,
    timeNote: rawTimeNote ? String(rawTimeNote) : undefined,
    isNewPayee,
  };
}

/**
 * Validates and converts file contents (CSV, JSON, XLSX) into DatasetValidationResult
 */
export async function parseTransactionFile(file: File): Promise<DatasetValidationResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const errors: string[] = [];
  const warnings: string[] = [];

  let rawRows: RawRow[] = [];

  try {
    if (extension === 'json') {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        rawRows = parsed;
      } else if (parsed && Array.isArray(parsed.transactions)) {
        rawRows = parsed.transactions;
      } else if (parsed && Array.isArray(parsed.data)) {
        rawRows = parsed.data;
      } else {
        errors.push('JSON must contain an array of transaction objects.');
      }
    } else if (extension === 'csv' || extension === 'txt' || extension === 'tsv') {
      const text = await file.text();
      const workbook = XLSX.read(text, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        errors.push('Empty CSV file detected.');
      } else {
        const worksheet = workbook.Sheets[firstSheetName];
        rawRows = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: '' });
      }
    } else if (extension === 'xlsx' || extension === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        errors.push('Excel file has no valid sheets.');
      } else {
        const worksheet = workbook.Sheets[firstSheetName];
        rawRows = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: '' });
      }
    } else {
      errors.push(`Unsupported file format (.${extension}). Please upload CSV, Excel (.xlsx/.xls), or JSON.`);
    }
  } catch (err: any) {
    errors.push(`File parsing failed: ${err?.message || 'Invalid format or structure.'}`);
  }

  if (rawRows.length === 0 && errors.length === 0) {
    errors.push('No transaction records found in uploaded file.');
  }

  const validTransactions: Transaction[] = [];
  let invalidCount = 0;

  rawRows.forEach((row, idx) => {
    const tx = normalizeTransactionRow(row, idx);
    if (!tx || tx.amount <= 0 || !tx.payee) {
      invalidCount++;
      if (invalidCount <= 3) {
        warnings.push(`Row #${idx + 1}: Skipped due to missing amount or payee name.`);
      }
    } else {
      validTransactions.push(tx);
    }
  });

  if (invalidCount > 3) {
    warnings.push(`...and ${invalidCount - 3} additional invalid or blank rows omitted.`);
  }

  // Calculate dates and baseline
  const dates = validTransactions.map((t) => t.date).filter(Boolean).sort();
  const startDate = dates[0] || new Date().toISOString().split('T')[0];
  const endDate = dates[dates.length - 1] || startDate;

  const totalVolume = validTransactions.reduce((acc, t) => acc + t.amount, 0);
  const detectedBaseline = calculateDynamicBaseline(validTransactions);

  return {
    isValid: errors.length === 0 && validTransactions.length > 0,
    totalRows: rawRows.length,
    validRows: validTransactions.length,
    invalidRows: invalidCount,
    errors,
    warnings,
    detectedBaseline,
    dateRange: { start: startDate, end: endDate },
    totalVolume,
    transactions: validTransactions,
  };
}

/**
 * Pre-configured Sample Datasets for 1-click investigator demonstration
 */
export const SAMPLE_DATASETS = {
  highRiskCrypto: {
    name: 'Suspicious Crypto Smurfing & Velocity Burst (High Risk)',
    description: 'Multiple large transfers to unverified exchange within rapid succession, nocturnal activity.',
    customer: {
      id: 'CUST-UPL-004',
      name: 'Julian Sterling',
      bankName: 'Sovereign Private Reserve Bank',
      accountNumber: '****-5591',
      accountType: 'Personal Checking',
      baseline: 7500,
    },
    csvContent: `id,date,amount,payee,channel,description,notes,timeNote
1,2024-08-01,4800,Target Stores,debit_card,Retail Shopping,Standard household purchase,
2,2024-08-02,28000,Corporate Payroll Deposit,transfer,Salary Deposit,Verified monthly salary,
3,2024-08-05,52000,Binance Global Crypto XYZ,online,Investment,First time transfer to virtual asset exchange,Initial outbound transfer
4,2024-08-05,48000,Binance Global Crypto XYZ,online,Investment,Same exchange beneficiary,35 mins after Tx #3
5,2024-08-06,44000,Binance Global Crypto XYZ,online,Investment,Subsequent high value withdrawal,Odd hours 03:15 AM
6,2024-08-07,3100,City Power & Gas,online,Utilities,Monthly utility bill,
7,2024-08-08,1200,Starbucks Coffee,debit_card,Dining,Routine debit card expense,
8,2024-08-09,8200,Whole Foods Market,debit_card,Groceries,Routine grocery shopping,`,
  },
  cleanConsumer: {
    name: 'Standard Consumer Checking (Clean Baseline)',
    description: 'Routine household spending, groceries, utilities, and scheduled mortgage.',
    customer: {
      id: 'CUST-UPL-005',
      name: 'Clara Oswald',
      bankName: 'Heritage Union Bank',
      accountNumber: '****-9240',
      accountType: 'Personal Checking',
      baseline: 5200,
    },
    csvContent: `id,date,amount,payee,channel,description,notes,timeNote
1,2024-08-01,3400,First District Mortgage,transfer,Housing,Scheduled monthly residential mortgage,
2,2024-08-02,16000,Biomedical Research Direct Payroll,transfer,Monthly Salary,Regular bi-weekly direct deposit,
3,2024-08-03,850,Trader Joes Groceries,debit_card,Food & Supplies,Weekly routine groceries,
4,2024-08-04,320,Verizon Wireless,online,Communications,Monthly mobile phone bill,
5,2024-08-05,1100,Nordstrom Department Store,debit_card,Clothing,Seasonal clothing purchase,
6,2024-08-07,450,Shell Oil Gas Station,debit_card,Transportation,Vehicle fuel fill-up,
7,2024-08-08,1400,Best Buy Electronics,online,Household,Home appliance replacement,
8,2024-08-09,4000,Fidelity Retirement Fund,transfer,Investment,Automated monthly 401k transfer,`,
  },
};
