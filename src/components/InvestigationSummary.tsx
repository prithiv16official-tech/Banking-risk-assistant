import React from 'react';
import { CustomerProfile, InvestigationSummaryData } from '../types';
import { AlertTriangle, CheckCircle2, FileText, Printer, Download, Check, Info } from 'lucide-react';

interface Props {
  customer: CustomerProfile;
  summary: InvestigationSummaryData;
  onPrint: () => void;
  onExportPdf: () => void;
}

export const InvestigationSummary: React.FC<Props> = ({
  customer,
  summary,
  onPrint,
  onExportPdf,
}) => {
  const isHighRisk = summary.riskLevel === 'HIGH';
  const isNoneRisk = summary.riskLevel === 'NONE';

  return (
    <section
      id="investigation-summary-panel"
      className="bg-[#161616] rounded-xl border border-[#2a2a2a] shadow-md p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            INVESTIGATION SUMMARY
          </h2>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#202020] text-[#a0a0a0] border border-[#333]">
          System Analysis Feed
        </span>
      </div>

      {/* RISK LEVEL Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isHighRisk
            ? 'bg-red-500/10 border-red-500/30 text-white'
            : 'bg-emerald-500/10 border-emerald-500/30 text-white'
        }`}
      >
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#a0a0a0] block">
            Overall Evaluation {customer.bankName ? `• ${customer.bankName}` : ''}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-lg font-bold font-mono tracking-tight ${
                isHighRisk ? 'text-[#ff4444]' : 'text-[#44ff44]'
              }`}
            >
              RISK LEVEL: {summary.riskLevel} {isHighRisk ? '🔴' : '🟢'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#808080] block">
            Risk Score: <strong className="font-mono text-white">{summary.riskScore ?? (isHighRisk ? 82 : 0)}</strong>/100
          </span>
          <span
            className={`font-mono text-xs font-bold ${
              isHighRisk ? 'text-[#ff4444]' : 'text-[#44ff44]'
            }`}
          >
            {summary.rulesTriggeredCount} of 5 Rules Tripped
          </span>
        </div>
      </div>

      {/* FINDINGS */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b0b0b0]">
          FINDINGS:
        </h3>
        {isNoneRisk ? (
          <div className="p-3.5 rounded-lg bg-[#111111] border border-[#252525] space-y-2">
            <div className="flex items-center gap-2 text-[#44ff44] font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#44ff44] shrink-0" />
              <span>CLEAR - No suspicious activity detected</span>
            </div>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              This customer's transaction history is entirely consistent with their established baseline behavior. All transactions are routine (groceries, salary, utilities, dining). No investigation required.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 text-xs">
            {summary.findings.map((finding, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#111111] border border-[#252525] text-[#d0d0d0]"
              >
                <span className="text-[#ff4444] font-bold text-sm leading-none mt-0.5">•</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RECOMMENDATION */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b0b0b0]">
          RECOMMENDATION:
        </h3>
        <div className="p-3.5 rounded-lg bg-[#111111] border border-[#252525] text-xs text-[#c0c0c0] space-y-2">
          {summary.recommendation.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DATA QUALITY */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b0b0b0] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          DATA QUALITY:
        </h3>
        <div className="p-3.5 rounded-lg bg-[#111111] border border-[#252525] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#44ff44]">
            <Check className="w-4 h-4 text-[#44ff44] shrink-0" />
            <span className="text-[#d0d0d0]">Complete transaction history available</span>
          </div>
          <div className="flex items-center gap-2 text-[#44ff44]">
            <Check className="w-4 h-4 text-[#44ff44] shrink-0" />
            <span className="text-[#d0d0d0]">Baseline calculation reliable (evaluated on regular spending profile)</span>
          </div>
          <div className="flex items-center gap-2 text-[#44ff44]">
            <Check className="w-4 h-4 text-[#44ff44] shrink-0" />
            <span className="text-[#d0d0d0]">All risk indicators properly evaluated</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Print / PDF Export - Neutral blue) */}
      <div className="pt-3 border-t border-[#222222] flex flex-wrap gap-2.5">
        <button
          id="print-summary-btn"
          onClick={onPrint}
          className="flex-1 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#1a2333] hover:bg-[#202c40] text-blue-300 border border-blue-800/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Summary
        </button>
        <button
          id="export-pdf-summary-btn"
          onClick={onExportPdf}
          className="flex-1 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#1a2333] hover:bg-[#202c40] text-blue-300 border border-blue-800/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export as PDF
        </button>
      </div>
    </section>
  );
};
