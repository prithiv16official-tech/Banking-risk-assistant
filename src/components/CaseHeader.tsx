import React from 'react';
import { CustomerProfile, InvestigationSummaryData } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, UserCheck, Calendar, Activity, ArrowRightLeft, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { INVESTIGATOR_OPTIONS } from '../data';

interface Props {
  customer: CustomerProfile;
  summary: InvestigationSummaryData;
  availableCases: CustomerProfile[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  investigator: string;
  onInvestigatorChange: (inv: string) => void;
  onBackToDashboard?: () => void;
}

export const CaseHeader: React.FC<Props> = ({
  customer,
  summary,
  availableCases,
  selectedCaseId,
  onSelectCase,
  investigator,
  onInvestigatorChange,
  onBackToDashboard,
}) => {
  const isHighRisk = summary.riskLevel === 'HIGH';
  const isNoneRisk = summary.riskLevel === 'NONE';

  return (
    <header className="bg-[#111111] border-b border-[#2a2a2a] text-[#e0e0e0] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar: Back to Dashboard & Case Switcher & System Identification */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#222222]">
          <div className="flex flex-wrap items-center gap-3">
            {onBackToDashboard && (
              <button
                id="back-to-dashboard-btn"
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 hover:text-white border border-blue-800/50 text-xs font-semibold transition-colors cursor-pointer"
                title="Return to Dashboard to select next customer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>&larr; Back to Dashboard</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#808080]">
                Customer:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#181818] rounded-lg border border-[#2a2a2a]">
                {availableCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  const isCaseHighRisk = c.riskRating === 'High';
                  return (
                    <button
                      key={c.id}
                      id={`case-selector-${c.id}`}
                      onClick={() => onSelectCase(c.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#262626] text-white shadow-xs border border-[#3d3d3d]'
                          : 'text-[#888] hover:text-[#ddd] hover:bg-[#202020]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCaseHighRisk ? 'bg-[#ff4444]' : 'bg-[#44ff44]'
                        }`}
                      />
                      <span>
                        {c.id} &bull; {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#707070] flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Automated Risk Profiling Protocol
            </span>
            <span>&bull;</span>
            <span className="font-mono">Read-Only Investigation Feed</span>
          </div>
        </div>

        {/* Main Header Box */}
        <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-5 lg:p-6 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Report Header metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#222222] text-[#c0c0c0] border border-[#333333]">
                  Case ID: {customer.caseId}
                </span>

                {/* Read-Only Status Badge */}
                <span
                  id="case-review-status-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    customer.reviewStatus === 'PENDING INVESTIGATION'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-[#44ff44] border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      customer.reviewStatus === 'PENDING INVESTIGATION'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-[#44ff44]'
                    }`}
                  />
                  Review Status: {customer.reviewStatus}
                </span>

                {/* Read-Only Risk Assessment */}
                <span
                  id="case-risk-level-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    isHighRisk
                      ? 'bg-red-500/15 text-[#ff4444] border-red-500/40'
                      : 'bg-emerald-500/15 text-[#44ff44] border-emerald-500/40'
                  }`}
                >
                  {isHighRisk ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff4444]" />
                      Risk Assessment: HIGH ⚠️
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#44ff44]" />
                      Risk Assessment: NONE ✅
                    </>
                  )}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  TRANSACTION RISK ANALYSIS REPORT
                </h1>
                <p className="text-sm text-[#8a8a8a] mt-1">
                  Subject: <strong className="text-white">{customer.name}</strong>
                  {customer.bankName && (
                    <>
                      {' '}&bull; Bank: <span className="text-[#c0c0c0] font-medium">{customer.bankName}</span>
                    </>
                  )}
                  {' '}&bull; Account:{' '}
                  <span className="font-mono text-[#b0b0b0]">{customer.accountNumber}</span> &bull;{' '}
                  {customer.accountType}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#707070] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#888]" />
                  Generated: <span className="font-mono text-[#a0a0a0]">{customer.generatedAt}</span>
                </span>
                <span>&bull;</span>
                <span className="text-[#888]">Non-Discretionary Heuristics Report</span>
              </div>
            </div>

            {/* Right: Assigned Investigator Selection (read/assign) */}
            <div className="bg-[#111111] p-4 rounded-xl border border-[#2a2a2a] min-w-[280px] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#808080] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Investigator Assignment
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202020] text-[#aaa]">
                  Assigned
                </span>
              </div>

              <div>
                <label htmlFor="investigator-select" className="sr-only">
                  Select Investigator
                </label>
                <select
                  id="investigator-select"
                  value={investigator}
                  onChange={(e) => onInvestigatorChange(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] text-[#e0e0e0] text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden cursor-pointer"
                >
                  {INVESTIGATOR_OPTIONS.map((inv) => (
                    <option key={inv} value={inv} className="bg-[#161616] text-[#e0e0e0]">
                      {inv}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-[#666] leading-tight">
                Investigator reads findings and records formal case determination below.
              </p>
            </div>
          </div>

          {/* Metrics Row (Left side requested structure) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#2a2a2a]">
            <div className="bg-[#101010] p-4 rounded-xl border border-[#262626]">
              <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
                Total Transactions
              </span>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {customer.transactions.length}
              </div>
              <span className="text-[11px] text-[#606060]">Evaluated ledger rows</span>
            </div>

            <div className="bg-[#101010] p-4 rounded-xl border border-[#262626]">
              <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
                Baseline Average
              </span>
              <div className="text-2xl font-bold text-[#40c057] font-mono mt-1">
                ${customer.averageTransaction.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#606060]">
                2x Threshold: ${(customer.averageTransaction * 2).toLocaleString()}
              </span>
            </div>

            <div className="bg-[#101010] p-4 rounded-xl border border-[#262626]">
              <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
                Rules Triggered
              </span>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  summary.rulesTriggeredCount > 0 ? 'text-[#ff4444]' : 'text-[#44ff44]'
                }`}
              >
                {summary.rulesTriggeredCount} / 5
              </div>
              <span className="text-[11px] text-[#606060]">
                {summary.rulesTriggeredCount > 0 ? 'Warrants analyst attention' : 'All heuristics cleared'}
              </span>
            </div>

            <div className="bg-[#101010] p-4 rounded-xl border border-[#262626]">
              <span className="text-xs text-[#808080] font-bold uppercase tracking-wider block">
                Primary Concern
              </span>
              <div
                className={`text-xl font-bold truncate mt-1 ${
                  isHighRisk ? 'text-[#ff4444]' : 'text-[#44ff44]'
                }`}
                title={summary.primaryConcern}
              >
                {summary.primaryConcern}
              </div>
              <span className="text-[11px] text-[#606060]">
                {isHighRisk ? 'Unusual pattern detected' : 'Routine spending profile'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
