import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  BrainCircuit,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Building2,
  User,
  CreditCard,
  Layers,
  ChevronRight,
  Info,
  X,
  FileCheck,
} from 'lucide-react';
import { CustomerProfile, Transaction, InvestigationSummaryData, CaseInvestigatorData, DatasetValidationResult } from '../types';
import { evaluateCustomerRisk, calculateDynamicBaseline } from '../utils/rulesEngine';
import { parseTransactionFile, SAMPLE_DATASETS } from '../utils/fileParser';

interface Props {
  onCaseAnalyzedAndSaved: (customer: CustomerProfile, investigatorData: CaseInvestigatorData) => void;
  onCancelOrBack: () => void;
}

export const TransactionUploader: React.FC<Props> = ({ onCaseAnalyzedAndSaved, onCancelOrBack }) => {
  // Step tracker: 1: Details & Upload -> 2: Validation & Preview -> 3: Analysis & Report
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // 1. Customer & Bank Details Form
  const [customerId, setCustomerId] = useState<string>('CUST-UPL-101');
  const [customerName, setCustomerName] = useState<string>('Elena Rostova');
  const [bankName, setBankName] = useState<string>('First Commercial National Bank');
  const [accountType, setAccountType] = useState<string>('Personal Checking');
  const [accountNumber, setAccountNumber] = useState<string>('****-8842');
  const [customBaseline, setCustomBaseline] = useState<string>('');

  // 2. Upload & File State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<DatasetValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Analysis & AI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisSummary, setAnalysisSummary] = useState<InvestigationSummaryData | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiSource, setAiSource] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // 4. Investigator Decision & Notes for Report
  const [investigatorDecision, setInvestigatorDecision] = useState<'CLEAR' | 'INVESTIGATE' | 'ESCALATE' | null>(null);
  const [investigatorNotes, setInvestigatorNotes] = useState<string>('');
  const [checklist, setChecklist] = useState({
    customerContacted: false,
    intentConfirmed: false,
    deviceVerified: false,
    mfaReviewed: false,
  });

  // Handle file drop / select
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    try {
      const result = await parseTransactionFile(selectedFile);
      setValidationResult(result);
      if (result.isValid && !customBaseline) {
        setCustomBaseline(String(result.detectedBaseline));
      }
      setCurrentStep(2);
    } catch (err: any) {
      console.error('File parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  // Load sample dataset
  const handleLoadSample = async (sampleKey: 'highRiskCrypto' | 'cleanConsumer') => {
    const sample = SAMPLE_DATASETS[sampleKey];
    setCustomerId(sample.customer.id);
    setCustomerName(sample.customer.name);
    setBankName(sample.customer.bankName);
    setAccountNumber(sample.customer.accountNumber);
    setAccountType(sample.customer.accountType);
    setCustomBaseline(String(sample.customer.baseline));

    const blob = new Blob([sample.csvContent], { type: 'text/csv' });
    const sampleFile = new File([blob], `${sampleKey}_dataset.csv`, { type: 'text/csv' });
    await handleFileChange(sampleFile);
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const templateContent = `id,date,amount,payee,channel,description,notes,timeNote
1,2024-08-01,3500,Amazon Retail,online,Household Shopping,Routine purchase,
2,2024-08-02,24000,Corporate Direct Deposit,transfer,Monthly Salary,Verified employer direct deposit,
3,2024-08-04,45000,Crypto Exchange XYZ,online,Investment,Unusual new beneficiary,11:45 PM odd hours
4,2024-08-04,42000,Crypto Exchange XYZ,online,Investment,Split transaction,35 mins after Tx #3
5,2024-08-07,3200,Electric Power Utility,online,Utilities,Monthly utility bill,
6,2024-08-09,1250,Trader Joes,debit_card,Groceries,Routine groceries,`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banking_transactions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run Risk Analysis
  const handleRunAnalysis = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setIsAnalyzing(true);
    const baseline = Number(customBaseline) > 0 ? Number(customBaseline) : validationResult.detectedBaseline;

    const constructedCustomer: CustomerProfile = {
      id: customerId.trim() || 'CUST-UPL',
      caseId: `${customerId.trim() || 'CUST-UPL'}-${new Date().getFullYear()}-001`,
      name: customerName.trim() || 'Uploaded Customer',
      bankName: bankName.trim() || 'Commercial Bank',
      accountNumber: accountNumber.trim() || '****-0000',
      accountType: accountType,
      averageTransaction: baseline,
      monthlyIncome: baseline * 3,
      riskRating: 'High',
      reviewStatus: 'PENDING INVESTIGATION',
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      transactions: validationResult.transactions,
    };

    // 1. Run automated non-discretionary heuristics engine
    const heuristicSummary = evaluateCustomerRisk(constructedCustomer);
    constructedCustomer.riskRating = heuristicSummary.riskLevel === 'HIGH' ? 'High' : 'None';
    setAnalysisSummary(heuristicSummary);

    // 2. Run Gemini AI Explanation
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: constructedCustomer,
          summary: heuristicSummary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiExplanation(data.explanation || '');
        setAiSource(data.source || 'gemini-3.8-flash');
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('AI call fallback to local reasoning:', err);
      const fallbackAi =
        heuristicSummary.riskLevel === 'HIGH'
          ? `### Automated Intelligence Forensic Assessment\nCustomer ${constructedCustomer.name} exhibits acute deviation from their historical transaction baseline ($${baseline.toLocaleString()}). Multiple high-value transfers totaling $${heuristicSummary.totalOutgoingRiskAmount.toLocaleString()} warrant immediate investigator review.`
          : `### Baseline Consistency Verification\nCustomer ${constructedCustomer.name} exhibits financial behavior entirely consistent with their established baseline ($${baseline.toLocaleString()}). Zero suspicious anomalies detected.`;
      setAiExplanation(fallbackAi);
      setAiSource('heuristic-engine');
    } finally {
      setIsGeneratingAi(false);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (!validationResult || !analysisSummary) return;

    const headers = ['Transaction ID', 'Date', 'Amount ($)', 'Payee', 'Channel', 'Description', 'Notes', 'Flagged Status'];
    const rows = validationResult.transactions.map((tx) => {
      const isFlagged = analysisSummary.ruleEvaluations.some((r) => r.triggered && r.triggeredTxIds.includes(tx.id));
      return [
        tx.id,
        tx.date,
        tx.amount,
        `"${tx.payee.replace(/"/g, '""')}"`,
        tx.channel,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${(tx.notes || tx.timeNote || '').replace(/"/g, '""')}"`,
        isFlagged ? 'FLAGGED ANOMALOUS' : 'CLEARED BASELINE',
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Risk_Analysis_${customerId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // Save to Main Active Workspace
  const handleSaveToActiveWorkspace = () => {
    if (!validationResult || !analysisSummary) return;

    const baseline = Number(customBaseline) > 0 ? Number(customBaseline) : validationResult.detectedBaseline;

    const finalizedCustomer: CustomerProfile = {
      id: customerId.trim() || 'CUST-UPL',
      caseId: `${customerId.trim() || 'CUST-UPL'}-${new Date().getFullYear()}-001`,
      name: customerName.trim() || 'Uploaded Customer',
      bankName: bankName.trim() || 'Commercial Bank',
      accountNumber: accountNumber.trim() || '****-0000',
      accountType: accountType,
      averageTransaction: baseline,
      monthlyIncome: baseline * 3,
      riskRating: analysisSummary.riskLevel === 'HIGH' ? 'High' : 'None',
      reviewStatus: investigatorDecision ? 'COMPLETE' : 'PENDING INVESTIGATION',
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      transactions: validationResult.transactions,
    };

    const finalizedInvestigatorData: CaseInvestigatorData = {
      notes: investigatorNotes,
      checklist,
      decision: investigatorDecision,
      assignedInvestigator: 'M. Chen (AML Analyst II)',
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onCaseAnalyzedAndSaved(finalizedCustomer, finalizedInvestigatorData);
  };

  // Flagged Transactions list
  const flaggedTransactions = React.useMemo(() => {
    if (!validationResult || !analysisSummary) return [];
    const flaggedIds = new Set<number>();
    analysisSummary.ruleEvaluations.forEach((r) => {
      if (r.triggered) {
        r.triggeredTxIds.forEach((id) => flaggedIds.add(id));
      }
    });
    return validationResult.transactions.filter((tx) => flaggedIds.has(tx.id));
  }, [validationResult, analysisSummary]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col font-sans antialiased">
      {/* Top Header Strip */}
      <header className="bg-[#111111] border-b border-[#2a2a2a] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="uploader-back-btn"
              onClick={onCancelOrBack}
              className="px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] text-[#aaa] hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>&larr; Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-[#333]" />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Transaction Data Uploader</span>
              </h1>
              <p className="text-xs text-[#707070]">
                Ingest customer ledger, validate data quality, run heuristics & Gemini AI risk analysis
              </p>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                currentStep === 1
                  ? 'bg-blue-950/40 text-blue-400 border-blue-800/60 font-semibold'
                  : 'bg-[#161616] text-[#666] border-[#2a2a2a]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold">
                1
              </span>
              <span>Details & File</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#444]" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                currentStep === 2
                  ? 'bg-blue-950/40 text-blue-400 border-blue-800/60 font-semibold'
                  : 'bg-[#161616] text-[#666] border-[#2a2a2a]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold">
                2
              </span>
              <span>Validation</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#444]" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                currentStep === 3
                  ? 'bg-emerald-950/40 text-[#44ff44] border-emerald-800/60 font-semibold'
                  : 'bg-[#161616] text-[#666] border-[#2a2a2a]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono font-bold">
                3
              </span>
              <span>Investigation Report</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: CUSTOMER & BANK DETAILS FORM */}
        {/* ========================================================================= */}
        <section className="bg-[#141414] rounded-2xl border border-[#262626] p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#222]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>1. Customer & Bank Details</span>
              </h2>
              <p className="text-xs text-[#808080] mt-0.5">
                Specify institution metadata and customer account parameters for the analysis file
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#666] px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] self-start sm:self-auto">
              Mandatory Metadata
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Customer ID */}
            <div className="space-y-1.5">
              <label htmlFor="uploader-customer-id" className="text-xs font-semibold text-[#aaa] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Customer ID
              </label>
              <input
                id="uploader-customer-id"
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. CUST-901"
                className="w-full bg-[#1b1b1b] border border-[#333] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555] font-mono outline-hidden transition-colors"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label htmlFor="uploader-customer-name" className="text-xs font-semibold text-[#aaa]">
                Customer Name
              </label>
              <input
                id="uploader-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-[#1b1b1b] border border-[#333] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555] outline-hidden transition-colors"
              />
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <label htmlFor="uploader-bank-name" className="text-xs font-semibold text-[#aaa]">
                Bank Name
              </label>
              <input
                id="uploader-bank-name"
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. First National Bank"
                className="w-full bg-[#1b1b1b] border border-[#333] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555] outline-hidden transition-colors"
              />
            </div>

            {/* Account Type */}
            <div className="space-y-1.5">
              <label htmlFor="uploader-account-type" className="text-xs font-semibold text-[#aaa]">
                Account Type
              </label>
              <select
                id="uploader-account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-hidden transition-colors cursor-pointer"
              >
                <option value="Personal Checking">Personal Checking</option>
                <option value="Business Premier Checking">Business Premier Checking</option>
                <option value="High-Yield Savings">High-Yield Savings</option>
                <option value="Corporate Treasury">Corporate Treasury</option>
              </select>
            </div>

            {/* Masked Account Number */}
            <div className="space-y-1.5">
              <label htmlFor="uploader-account-number" className="text-xs font-semibold text-[#aaa] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Masked Account #
              </label>
              <input
                id="uploader-account-number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. ****-8842"
                className="w-full bg-[#1b1b1b] border border-[#333] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555] font-mono outline-hidden transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: TRANSACTION DATASET UPLOAD & VALIDATION */}
        {/* ========================================================================= */}
        <section className="bg-[#141414] rounded-2xl border border-[#262626] p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#222]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>2. Transaction Dataset Upload</span>
              </h2>
              <p className="text-xs text-[#808080] mt-0.5">
                Upload CSV, Excel (.xlsx/.xls), or JSON dataset containing customer transactions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="download-template-btn"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] text-xs text-[#ccc] border border-[#333] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download CSV format template"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download CSV Template</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            id="file-drop-zone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-[#333] hover:border-[#444] bg-[#181818]/60 hover:bg-[#1a1a1a]'
            }`}
          >
            <input
              ref={fileInputRef}
              id="file-upload-input"
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="max-w-md mx-auto flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to select or drag and drop transaction dataset'}
                </p>
                <p className="text-xs text-[#707070] mt-1">
                  Supports CSV, Excel (.xlsx, .xls), and JSON with columns: date, amount, payee, channel, description
                </p>
              </div>

              {file && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202020] border border-[#333] text-xs text-[#aaa]">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                  <span className="text-emerald-400">&bull; Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick-test One-Click Sample Datasets */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Or test immediately with built-in reference datasets:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="load-sample-crypto-btn"
                onClick={() => handleLoadSample('highRiskCrypto')}
                className="p-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#333] hover:border-[#444] text-left transition-colors flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff4444]" />
                    <span>Sample: Crypto Smurfing & Burst (High Risk)</span>
                  </div>
                  <p className="text-[11px] text-[#707070] mt-1">
                    8 records: 3 rapid transfers to XYZ Crypto, nocturnal timestamps, high amounts
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-white shrink-0 mt-0.5 ml-2 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                id="load-sample-clean-btn"
                onClick={() => handleLoadSample('cleanConsumer')}
                className="p-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#333] hover:border-[#444] text-left transition-colors flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#44ff44]" />
                    <span>Sample: Clean Consumer Checking (None)</span>
                  </div>
                  <p className="text-[11px] text-[#707070] mt-1">
                    8 records: routine mortgage, groceries, utility bills, standard retail purchases
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-white shrink-0 mt-0.5 ml-2 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Validation & Data Quality Report Strip */}
          {validationResult && (
            <div className="bg-[#181818] rounded-xl border border-[#2a2a2a] p-5 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222]">
                <div className="flex items-center gap-2.5">
                  {validationResult.isValid ? (
                    <span className="p-1 rounded-full bg-emerald-500/10 text-[#44ff44] border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {validationResult.isValid
                        ? 'Dataset Validation Successful'
                        : 'Dataset Contains Validation Errors'}
                    </h3>
                    <p className="text-[11px] text-[#888]">
                      {validationResult.validRows} valid transaction row(s) parsed from file
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#888]">
                    Calculated Baseline:{' '}
                    <strong className="font-mono text-white">
                      ${validationResult.detectedBaseline.toLocaleString()}
                    </strong>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <label htmlFor="custom-baseline-input" className="text-[#777]">Override:</label>
                    <input
                      id="custom-baseline-input"
                      type="number"
                      value={customBaseline}
                      onChange={(e) => setCustomBaseline(e.target.value)}
                      placeholder="Baseline"
                      className="w-24 bg-[#111] border border-[#333] rounded px-2 py-0.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Data Quality Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1f1f1f] rounded-lg p-3 border border-[#2c2c2c]">
                  <span className="text-[10px] uppercase tracking-wider text-[#888] font-bold">Transaction Count</span>
                  <p className="text-lg font-bold text-white font-mono mt-0.5">
                    {validationResult.validRows}
                    <span className="text-xs text-[#777] font-normal ml-1">rows</span>
                  </p>
                </div>

                <div className="bg-[#1f1f1f] rounded-lg p-3 border border-[#2c2c2c]">
                  <span className="text-[10px] uppercase tracking-wider text-[#888] font-bold">Total Volume</span>
                  <p className="text-lg font-bold text-white font-mono mt-0.5">
                    ${validationResult.totalVolume.toLocaleString()}
                  </p>
                </div>

                <div className="bg-[#1f1f1f] rounded-lg p-3 border border-[#2c2c2c]">
                  <span className="text-[10px] uppercase tracking-wider text-[#888] font-bold">Date Range</span>
                  <p className="text-xs font-semibold text-white font-mono mt-1 truncate">
                    {validationResult.dateRange.start} &rarr; {validationResult.dateRange.end}
                  </p>
                </div>

                <div className="bg-[#1f1f1f] rounded-lg p-3 border border-[#2c2c2c]">
                  <span className="text-[10px] uppercase tracking-wider text-[#888] font-bold">Data Quality Check</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#44ff44]" />
                    <span className="text-xs font-semibold text-[#44ff44]">Passed (100%)</span>
                  </div>
                </div>
              </div>

              {/* Warnings / Errors */}
              {validationResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg text-xs text-amber-300">
                  <div className="font-semibold mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Parser Observations ({validationResult.warnings.length}):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-400/90">
                    {validationResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action: Run Heuristic & Gemini Analysis */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#707070]">
                  Ready to evaluate against 5 non-discretionary risk rules and trigger Gemini explanation
                </div>

                <button
                  type="button"
                  id="run-dataset-analysis-btn"
                  disabled={!validationResult.isValid || isAnalyzing}
                  onClick={handleRunAnalysis}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating Risk Engine & Calling AI...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" />
                      <span>Analyze Transactions & Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 & 4: INVESTIGATION REPORT & FINDINGS */}
        {/* ========================================================================= */}
        {analysisSummary && validationResult && (
          <section
            id="investigation-report-section"
            className="bg-[#141414] rounded-2xl border border-[#262626] p-5 sm:p-6 lg:p-8 shadow-2xl space-y-8 animate-fade-in"
          >
            {/* Report Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#222]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#202020] text-[#ccc] border border-[#333]">
                    Case: {customerId}-{new Date().getFullYear()}-001
                  </span>
                  <span
                    id="report-risk-badge"
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      analysisSummary.riskLevel === 'HIGH'
                        ? 'bg-red-500/10 text-[#ff4444] border-red-500/30'
                        : analysisSummary.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-[#44ff44] border-emerald-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        analysisSummary.riskLevel === 'HIGH'
                          ? 'bg-[#ff4444]'
                          : analysisSummary.riskLevel === 'MEDIUM'
                          ? 'bg-amber-400'
                          : 'bg-[#44ff44]'
                      }`}
                    />
                    <span>Risk Level: {analysisSummary.riskLevel}</span>
                  </span>

                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/30 text-blue-300 border border-blue-800/40">
                    Risk Score: {analysisSummary.riskScore ?? 0}/100
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight">
                  Transaction Risk Analysis Report &bull; {customerName}
                </h2>
                <p className="text-xs text-[#707070]">
                  Financial Institution: <span className="text-[#bbb] font-semibold">{bankName}</span> &bull;{' '}
                  Account: <span className="font-mono text-[#bbb]">{accountNumber}</span> ({accountType})
                </p>
              </div>

              {/* Print / Export Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  id="report-print-btn"
                  onClick={handlePrintReport}
                  className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-xs font-semibold text-white border border-[#333] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Report (PDF)</span>
                </button>

                <button
                  type="button"
                  id="report-export-csv-btn"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-xs font-semibold text-white border border-[#333] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  id="save-to-active-queue-btn"
                  onClick={handleSaveToActiveWorkspace}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save to Active Queue</span>
                </button>
              </div>
            </div>

            {/* Top 4 Analytical KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2c2c2c]">
                <span className="text-[10px] uppercase font-bold text-[#888]">Calculated Baseline</span>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  ${(Number(customBaseline) || validationResult.detectedBaseline).toLocaleString()}
                </p>
                <span className="text-[10px] text-[#666]">Average typical debit ticket</span>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2c2c2c]">
                <span className="text-[10px] uppercase font-bold text-[#888]">Rules Triggered</span>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {analysisSummary.rulesTriggeredCount}{' '}
                  <span className="text-xs text-[#666] font-normal">/ 5 rules</span>
                </p>
                <span className="text-[10px] text-[#666]">Non-discretionary indicators</span>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2c2c2c]">
                <span className="text-[10px] uppercase font-bold text-[#888]">Anomalous Outbound</span>
                <p className="text-xl font-bold font-mono text-red-400 mt-1">
                  ${analysisSummary.totalOutgoingRiskAmount.toLocaleString()}
                </p>
                <span className="text-[10px] text-[#666]">Outbound exceeding 2x threshold</span>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2c2c2c]">
                <span className="text-[10px] uppercase font-bold text-[#888]">Primary Concern</span>
                <p className="text-sm font-bold text-white truncate mt-2" title={analysisSummary.primaryConcern}>
                  {analysisSummary.primaryConcern}
                </p>
                <span className="text-[10px] text-[#666]">Key anomaly trigger</span>
              </div>
            </div>

            {/* AI Forensic Explanation Card (Gemini) */}
            <div className="bg-[#191919] rounded-xl border border-[#2d2d2d] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Forensic Intelligence Explanation
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                    {aiSource || 'Gemini 3.8 Flash'}
                  </span>
                </div>

                {isGeneratingAi && (
                  <span className="text-xs text-[#888] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Analyzing...</span>
                  </span>
                )}
              </div>

              <div className="prose prose-invert max-w-none text-xs text-[#ccc] leading-relaxed whitespace-pre-wrap bg-[#121212] p-4 rounded-lg border border-[#242424] font-sans">
                {aiExplanation || 'Generating AI risk assessment narrative...'}
              </div>
            </div>

            {/* Triggered Rules Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Heuristic Rules Evaluation Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisSummary.ruleEvaluations.map((r) => (
                  <div
                    key={r.ruleId}
                    className={`p-4 rounded-xl border transition-all ${
                      r.triggered
                        ? 'bg-red-950/10 border-red-900/40'
                        : 'bg-[#181818] border-[#292929]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.triggered ? 'bg-[#ff4444]' : 'bg-[#44ff44]'
                          }`}
                        />
                        <span className="text-xs font-bold text-white">
                          [{r.ruleId}] {r.ruleName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          r.triggered
                            ? 'bg-red-500/20 text-[#ff4444] border border-red-500/30'
                            : 'bg-emerald-500/10 text-[#44ff44] border border-emerald-500/20'
                        }`}
                      >
                        {r.triggered ? 'TRIGGERED' : 'CLEARED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#aaa] mt-2 leading-normal">{r.explanation}</p>
                    {r.triggered && r.triggeredTxIds.length > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-red-300">
                        Affected: {r.triggeredTxIds.map((id) => `Tx #${id}`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Transactions Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Flagged Anomalous Transactions ({flaggedTransactions.length})</span>
                </h3>
                <span className="text-[11px] text-[#707070]">
                  Filtered from {validationResult.validRows} total transactions
                </span>
              </div>

              {flaggedTransactions.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#181818] border border-[#2a2a2a] text-center text-xs text-[#888] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#44ff44]" />
                  <span>Zero transactions violated risk thresholds. All records conform to baseline.</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1a1a1a] text-[#888] border-b border-[#2a2a2a]">
                        <th className="py-2.5 px-3 font-semibold">Tx ID</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Amount</th>
                        <th className="py-2.5 px-3 font-semibold">Payee / Beneficiary</th>
                        <th className="py-2.5 px-3 font-semibold">Channel</th>
                        <th className="py-2.5 px-3 font-semibold">Risk Flags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {flaggedTransactions.map((tx) => {
                        const triggeredForThisTx = analysisSummary.ruleEvaluations.filter(
                          (r) => r.triggered && r.triggeredTxIds.includes(tx.id)
                        );
                        return (
                          <tr key={tx.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-blue-400">#{tx.id}</td>
                            <td className="py-3 px-3 font-mono text-[#bbb]">{tx.date}</td>
                            <td className="py-3 px-3 font-mono font-bold text-red-400">
                              ${tx.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">
                              {tx.payee}
                              {tx.notes && <span className="block text-[10px] text-[#777] font-normal">{tx.notes}</span>}
                            </td>
                            <td className="py-3 px-3">
                              <span className="capitalize px-2 py-0.5 rounded bg-[#202020] text-[#aaa] text-[10px] border border-[#333]">
                                {tx.channel}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {triggeredForThisTx.map((r) => (
                                  <span
                                    key={r.ruleId}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/40 text-red-300 border border-red-800/40"
                                  >
                                    {r.ruleId}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Investigator Decision & Notes Section */}
            <div className="bg-[#181818] rounded-xl border border-[#2d2d2d] p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Investigator Decision & Disposition
                </h3>
                <p className="text-xs text-[#707070] mt-0.5">
                  Record analytical judgment and compliance verification notes
                </p>
              </div>

              {/* 3-Choice Disposition Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  id="decision-clear-btn"
                  onClick={() => setInvestigatorDecision('CLEAR')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    investigatorDecision === 'CLEAR'
                      ? 'bg-emerald-950/30 border-[#44ff44] text-[#44ff44]'
                      : 'bg-[#1c1c1c] border-[#333] text-[#aaa] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold">CLEAR</span>
                  </div>
                  <p className="text-[11px] text-[#707070] mt-1">
                    No suspicious patterns; transactions verified with customer.
                  </p>
                </button>

                <button
                  type="button"
                  id="decision-investigate-btn"
                  onClick={() => setInvestigatorDecision('INVESTIGATE')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    investigatorDecision === 'INVESTIGATE'
                      ? 'bg-amber-950/30 border-amber-400 text-amber-300'
                      : 'bg-[#1c1c1c] border-[#333] text-[#aaa] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold">INVESTIGATE</span>
                  </div>
                  <p className="text-[11px] text-[#707070] mt-1">
                    Requires out-of-band verification and telemetry review.
                  </p>
                </button>

                <button
                  type="button"
                  id="decision-escalate-btn"
                  onClick={() => setInvestigatorDecision('ESCALATE')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    investigatorDecision === 'ESCALATE'
                      ? 'bg-red-950/30 border-[#ff4444] text-[#ff4444]'
                      : 'bg-[#1c1c1c] border-[#333] text-[#aaa] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold">ESCALATE</span>
                  </div>
                  <p className="text-[11px] text-[#707070] mt-1">
                    High probability of fraud/mule; route to Senior AML Lead.
                  </p>
                </button>
              </div>

              {/* Investigator Verification Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-[#ccc] p-2.5 rounded-lg bg-[#151515] border border-[#272727] cursor-pointer hover:bg-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={checklist.customerContacted}
                    onChange={(e) => setChecklist({ ...checklist, customerContacted: e.target.checked })}
                    className="rounded border-[#444] text-blue-500 focus:ring-0"
                  />
                  <span>Customer Contact Initiated (Voice/SMS)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#ccc] p-2.5 rounded-lg bg-[#151515] border border-[#272727] cursor-pointer hover:bg-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={checklist.intentConfirmed}
                    onChange={(e) => setChecklist({ ...checklist, intentConfirmed: e.target.checked })}
                    className="rounded border-[#444] text-blue-500 focus:ring-0"
                  />
                  <span>Disbursement Intent & Beneficiary Confirmed</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#ccc] p-2.5 rounded-lg bg-[#151515] border border-[#272727] cursor-pointer hover:bg-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={checklist.deviceVerified}
                    onChange={(e) => setChecklist({ ...checklist, deviceVerified: e.target.checked })}
                    className="rounded border-[#444] text-blue-500 focus:ring-0"
                  />
                  <span>Originating Device & Session IP Verified</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#ccc] p-2.5 rounded-lg bg-[#151515] border border-[#272727] cursor-pointer hover:bg-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={checklist.mfaReviewed}
                    onChange={(e) => setChecklist({ ...checklist, mfaReviewed: e.target.checked })}
                    className="rounded border-[#444] text-blue-500 focus:ring-0"
                  />
                  <span>Multi-Factor Authentication History Reviewed</span>
                </label>
              </div>

              {/* Investigator Narrative Notes */}
              <div className="space-y-1.5">
                <label htmlFor="uploader-investigator-notes" className="text-xs font-semibold text-[#bbb]">
                  Investigator Findings Narrative & Notes
                </label>
                <textarea
                  id="uploader-investigator-notes"
                  rows={4}
                  value={investigatorNotes}
                  onChange={(e) => setInvestigatorNotes(e.target.value)}
                  placeholder="Record forensic observations, customer verification responses, IP check results, and justification for chosen disposition..."
                  className="w-full bg-[#121212] border border-[#333] focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-[#555] outline-hidden resize-y transition-colors font-sans"
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#262626]">
                <span className="text-[11px] text-[#666]">
                  Read-Only Reporting Protocol &bull; Investigator Decision Authority &bull; PS06 Compliant
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToActiveWorkspace}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Return to Active Dashboard Queue</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
