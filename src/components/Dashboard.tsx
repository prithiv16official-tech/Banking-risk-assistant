import React, { useState } from 'react';
import { CustomerProfile, CaseInvestigatorData } from '../types';
import { evaluateCustomerRisk } from '../utils/rulesEngine';
import {
  Shield,
  Search,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  LogOut,
  Clock,
  FileText,
  Building,
  CreditCard,
  TrendingUp,
  Activity,
  Layers,
  Upload,
} from 'lucide-react';

interface Props {
  customers: CustomerProfile[];
  investigatorDataMap: Record<string, CaseInvestigatorData>;
  currentInvestigator: string;
  onAnalyzeCustomer: (customerId: string) => void;
  onSwitchInvestigator: () => void;
  onOpenUploader: () => void;
}

export const Dashboard: React.FC<Props> = ({
  customers,
  investigatorDataMap,
  currentInvestigator,
  onAnalyzeCustomer,
  onSwitchInvestigator,
  onOpenUploader,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'CUST001');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const selectedCaseData = selectedCustomer ? investigatorDataMap[selectedCustomer.id] : undefined;
  const selectedSummary = selectedCustomer ? evaluateCustomerRisk(selectedCustomer) : null;

  // Global queue stats
  const totalCases = customers.length;
  const highRiskCount = customers.filter(
    (c) => evaluateCustomerRisk(c).riskLevel === 'HIGH'
  ).length;
  const cleanCount = totalCases - highRiskCount;
  const reviewedCount = customers.filter(
    (c) => investigatorDataMap[c.id]?.decision && investigatorDataMap[c.id]?.decision !== 'UNREVIEWED' as any
  ).length;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] flex flex-col">
      {/* Top Application Header */}
      <header className="bg-[#121212] border-b border-[#242424] px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-blue-400 shadow-xs">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  TRANSACTION RISK ANALYSIS PORTAL
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 font-semibold">
                  PS06 Compliant
                </span>
              </div>
              <p className="text-[11px] text-[#777]">
                Banking Fraud Investigation &amp; Case Disposition System
              </p>
            </div>
          </div>

          {/* Current Investigator Profile & Upload Button */}
          <div className="flex items-center gap-3">
            <button
              id="dashboard-open-uploader-btn"
              type="button"
              onClick={onOpenUploader}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload new transaction dataset (CSV / Excel / JSON)"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Upload Dataset</span>
            </button>

            <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-900/30 border border-blue-700/40 flex items-center justify-center text-blue-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#777] block font-medium">Active Investigator</span>
                <span className="text-xs font-semibold text-white block truncate max-w-[170px]">
                  {currentInvestigator}
                </span>
              </div>
            </div>

            <button
              id="switch-investigator-btn"
              type="button"
              onClick={onSwitchInvestigator}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#303030] text-[#999] hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign In / Switch Investigator Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch / Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-7">
        {/* Workflow breadcrumb banner */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#999]">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Workflow:</span>
            <span className="text-white font-medium bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#333]">
              1. Select Customer
            </span>
            <span className="text-[#555]">→</span>
            <span className="text-[#bbb]">2. Click &ldquo;Analyze&rdquo;</span>
            <span className="text-[#555]">→</span>
            <span className="text-[#bbb]">3. Read Findings &amp; Write Notes</span>
            <span className="text-[#555]">→</span>
            <span className="text-[#bbb]">4. CLEAR / INVESTIGATE / ESCALATE</span>
          </div>

          <span className="text-[11px] text-[#707070] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Heuristics Engine Online
          </span>
        </div>

        {/* PRIMARY ACTION CARD: Select customer from dropdown & Click Analyze */}
        <section
          id="customer-selection-card"
          className="bg-linear-to-b from-[#161616] to-[#121212] border border-[#2c2c2c] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#262626]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                  Primary Action
                </span>
                <span className="text-xs text-[#888]">Customer Investigation Workspace</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Select Customer &amp; Run Risk Analysis
              </h2>
              <p className="text-xs text-[#909090] mt-1 max-w-2xl">
                Choose a customer account from the repository dropdown to evaluate non-discretionary risk rules, inspect transactions, and submit formal case notes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Dropdown Selector & Selected Preview */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="customer-dropdown"
                  className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-blue-400" />
                  Select Customer from Dropdown:
                </label>

                <div className="relative">
                  <select
                    id="customer-dropdown"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#1b1b1b] border-2 border-[#383838] hover:border-blue-500/60 focus:border-blue-500 text-white text-sm rounded-xl p-3.5 font-medium transition-colors cursor-pointer outline-hidden shadow-inner"
                  >
                    {customers.map((c) => {
                      const caseData = investigatorDataMap[c.id];
                      return (
                        <option key={c.id} value={c.id} className="bg-[#141414] text-white py-2">
                          {c.id} — {c.name} ({c.accountType} • {c.accountNumber}) [Decision: {caseData?.decision || 'PENDING'}]
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Selected Customer Snapshot Box */}
              {selectedCustomer && (
                <div className="bg-[#101010] border border-[#242424] rounded-xl p-4.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        {selectedCustomer.name}
                      </span>
                      <span className="text-xs font-mono text-[#888]">
                        ({selectedCustomer.id})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#1c1c1c] text-[#a0a0a0] font-mono border border-[#303030]">
                        Case ID: {selectedCustomer.caseId}
                      </span>
                      {selectedSummary?.riskLevel === 'HIGH' ? (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/50 text-[#ff4444] font-bold border border-red-800/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Risk: HIGH
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/50 text-[#44ff44] font-bold border border-emerald-800/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Risk: NONE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer parameter pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                      <span className="text-[10px] text-[#707070] font-semibold uppercase block">Account</span>
                      <span className="font-mono text-white font-medium">{selectedCustomer.accountNumber}</span>
                      <span className="text-[10px] text-[#606060] block truncate">{selectedCustomer.accountType}</span>
                    </div>

                    <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                      <span className="text-[10px] text-[#707070] font-semibold uppercase block">Baseline Avg</span>
                      <span className="font-mono text-[#40c057] font-bold">${selectedCustomer.averageTransaction.toLocaleString()}</span>
                      <span className="text-[10px] text-[#606060] block">2x: ${(selectedCustomer.averageTransaction * 2).toLocaleString()}</span>
                    </div>

                    <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                      <span className="text-[10px] text-[#707070] font-semibold uppercase block">Transactions</span>
                      <span className="font-mono text-white font-bold">{selectedCustomer.transactions.length} Records</span>
                      <span className="text-[10px] text-[#606060] block">Ledger depth</span>
                    </div>

                    <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                      <span className="text-[10px] text-[#707070] font-semibold uppercase block">Current Disposition</span>
                      <span
                        className={`font-bold font-mono text-xs ${
                          selectedCaseData?.decision === 'CLEAR'
                            ? 'text-[#44ff44]'
                            : selectedCaseData?.decision === 'ESCALATE'
                            ? 'text-[#ff6666]'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedCaseData?.decision || 'UNREVIEWED'}
                      </span>
                      <span className="text-[10px] text-[#606060] block truncate">
                        {selectedCaseData?.lastSaved ? selectedCaseData.lastSaved : 'Not saved'}
                      </span>
                    </div>
                  </div>

                  {selectedCaseData?.notes && (
                    <div className="bg-[#141414] p-2.5 rounded-lg border border-[#222] text-[11px] text-[#888] line-clamp-2">
                      <strong className="text-[#bbb]">Recorded Note: </strong>
                      {selectedCaseData.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: The big "Analyze" button */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-3 bg-[#111111] p-5 rounded-xl border border-[#262626]">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  Action Required
                </span>
                <h3 className="text-sm font-semibold text-white mt-0.5">
                  Launch Risk Findings View
                </h3>
                <p className="text-[11px] text-[#707070] mt-1">
                  Load automated rule evaluations, examine ledger deviations, and document your investigative disposition.
                </p>
              </div>

              <button
                id="analyze-customer-btn"
                type="button"
                onClick={() => onAnalyzeCustomer(selectedCustomerId)}
                className="w-full py-4 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer border border-blue-400/30"
              >
                <Search className="w-4 h-4" />
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </button>

              <span className="text-[10px] text-center text-[#555] block">
                Opens full analysis findings report for {selectedCustomer.name}
              </span>
            </div>
          </div>
        </section>

        {/* Quick Ingest & Upload Card */}
        <section
          id="dashboard-uploader-card"
          className="bg-linear-to-r from-[#121824] via-[#141414] to-[#141414] border border-[#233047] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Transaction Data Uploader
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/40 font-semibold">
                  New
                </span>
              </div>
              <p className="text-xs text-[#909090] mt-0.5 max-w-xl">
                Ingest external transaction datasets (CSV / Excel / JSON), validate data quality, calculate dynamic baseline, run the 5-rule heuristics engine, and generate Gemini AI forensic risk explanations.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="launch-uploader-banner-btn"
            onClick={onOpenUploader}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Launch Uploader</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Case Repository Queue Table */}
        <section id="case-repository-queue" className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#242424]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Customer Case Repository &amp; Review Queue
              </h3>
              <p className="text-xs text-[#808080] mt-0.5">
                All accounts tracked under non-discretionary fraud rules. Select any customer to inspect findings or adjust dispositions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#1c1c1c] border border-[#2c2c2c] text-[#a0a0a0]">
                Total: <strong className="text-white">{totalCases}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300">
                High Risk: <strong>{highRiskCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                Clean: <strong>{cleanCount}</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#282828] text-[#808080] uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-3">Customer / Case ID</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3 text-right">Baseline Avg</th>
                  <th className="py-3 px-3 text-center">Risk Assessment</th>
                  <th className="py-3 px-3 text-center">Rules Triggered</th>
                  <th className="py-3 px-3 text-center">Investigator Disposition</th>
                  <th className="py-3 px-3">Assigned Investigator</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]">
                {customers.map((c) => {
                  const summary = evaluateCustomerRisk(c);
                  const caseData = investigatorDataMap[c.id];
                  const isSelected = c.id === selectedCustomerId;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#1a1a1a] transition-colors ${
                        isSelected ? 'bg-[#181d24]/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="font-mono text-[10px] text-[#777]">{c.caseId}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[#ccc]">{c.accountNumber}</div>
                        <div className="text-[10px] text-[#777]">{c.accountType}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-[#40c057]">
                        ${c.averageTransaction.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {summary.riskLevel === 'HIGH' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-[#ff4444] border border-red-700/50">
                            <AlertTriangle className="w-3 h-3" />
                            HIGH RISK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-[#44ff44] border border-emerald-700/50">
                            <CheckCircle2 className="w-3 h-3" />
                            NONE (CLEAN)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`font-bold ${
                            summary.rulesTriggeredCount > 0 ? 'text-[#ff5555]' : 'text-[#44ff44]'
                          }`}
                        >
                          {summary.rulesTriggeredCount} / 5
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            caseData?.decision === 'CLEAR'
                              ? 'bg-emerald-950/60 text-[#44ff44] border border-emerald-700/40'
                              : caseData?.decision === 'ESCALATE'
                              ? 'bg-red-950/60 text-[#ff6666] border border-red-700/40'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-700/40'
                          }`}
                        >
                          {caseData?.decision || 'UNREVIEWED'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#bbb] text-[11px]">
                        {caseData?.assignedInvestigator || currentInvestigator}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onAnalyzeCustomer(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-semibold transition-colors cursor-pointer border border-[#383838]"
                        >
                          Analyze &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Global System Metrics & Heuristics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl">
            <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
              Automated Heuristics
            </span>
            <div className="text-xl font-bold text-white mt-1">5 Core Risk Rules</div>
            <p className="text-[11px] text-[#666] mt-0.5">
              Large Transfer &bull; Payee Burst &bull; Odd Hours &bull; Pattern Break &bull; Rapid Succession
            </p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl">
            <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
              Investigator Decisions
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {reviewedCount} / {totalCases} Recorded
            </div>
            <p className="text-[11px] text-[#666] mt-0.5">
              Strict human-in-the-loop: CLEAR, INVESTIGATE, or ESCALATE
            </p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl">
            <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
              Governance &amp; Standard
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">PS06 Read-Only</div>
            <p className="text-[11px] text-[#666] mt-0.5">
              System reports findings only; zero automatic freezes or filing stubs
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
