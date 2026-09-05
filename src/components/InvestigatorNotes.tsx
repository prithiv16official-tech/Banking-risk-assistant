import React, { useState } from 'react';
import { CaseInvestigatorData, InvestigatorDecision } from '../types';
import { Edit3, CheckSquare, Square, Save, Printer, Download, Archive, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface Props {
  caseId: string;
  data: CaseInvestigatorData;
  onSave: (data: CaseInvestigatorData) => void;
  onSaveAndReturn?: (data: CaseInvestigatorData) => void;
  onPrint: () => void;
  onExportPdf: () => void;
  isCleanCase?: boolean;
}

export const InvestigatorNotes: React.FC<Props> = ({
  caseId,
  data,
  onSave,
  onSaveAndReturn,
  onPrint,
  onExportPdf,
  isCleanCase = false,
}) => {
  const [notes, setNotes] = useState(data.notes);
  const [checklist, setChecklist] = useState(data.checklist);
  const [decision, setDecision] = useState<InvestigatorDecision>(data.decision);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [isArchived, setIsArchived] = useState(false);

  // Sync state if caseId changes
  React.useEffect(() => {
    setNotes(data.notes);
    setChecklist(data.checklist);
    setDecision(data.decision);
    setSavedFeedback(null);
    setIsArchived(false);
  }, [caseId, data]);

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onSave({
      ...data,
      notes,
      checklist,
      decision,
      lastSaved: `Today at ${timestamp}`,
    });
    setSavedFeedback(`Notes recorded at ${timestamp}`);
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  const handleSaveAndReturn = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedData: CaseInvestigatorData = {
      ...data,
      notes,
      checklist,
      decision,
      lastSaved: `Today at ${timestamp}`,
    };
    onSave(updatedData);
    if (onSaveAndReturn) {
      onSaveAndReturn(updatedData);
    }
  };

  const handleArchive = () => {
    setIsArchived(true);
    setSavedFeedback('Case archived to historical audit records.');
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  return (
    <section
      id="investigator-notes-section"
      className="bg-[#161616] rounded-xl border border-[#2a2a2a] shadow-md p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            INVESTIGATOR NOTES
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-[11px] font-semibold text-[#44ff44] bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {savedFeedback}
            </span>
          )}
          {data.lastSaved && !savedFeedback && (
            <span className="text-[10px] text-[#777] font-mono">
              Last saved: {data.lastSaved}
            </span>
          )}
        </div>
      </div>

      {/* Large text area */}
      <div className="space-y-1.5">
        <label htmlFor="investigator-narrative" className="text-xs font-semibold text-[#b0b0b0] block">
          Investigative Narrative & Case Rationale:
        </label>
        <textarea
          id="investigator-narrative"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record factual observations, customer interview findings, IP/session telemetry remarks, and rationale for determination..."
          className="w-full bg-[#101010] border border-[#2a2a2a] rounded-xl p-3.5 text-xs text-[#e0e0e0] placeholder-[#555] focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans leading-relaxed"
        />
      </div>

      {/* Checklist inside notes area */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#b0b0b0] block">
          Investigator Verification Checklist:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            id="checklist-customer-contacted"
            onClick={() => toggleChecklist('customerContacted')}
            className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
              checklist.customerContacted
                ? 'bg-[#15231c] border-emerald-600/40 text-emerald-200'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            {checklist.customerContacted ? (
              <CheckSquare className="w-4 h-4 text-[#44ff44] shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#555] shrink-0" />
            )}
            <span>Customer contacted and verified</span>
          </button>

          <button
            type="button"
            id="checklist-intent-confirmed"
            onClick={() => toggleChecklist('intentConfirmed')}
            className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
              checklist.intentConfirmed
                ? 'bg-[#15231c] border-emerald-600/40 text-emerald-200'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            {checklist.intentConfirmed ? (
              <CheckSquare className="w-4 h-4 text-[#44ff44] shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#555] shrink-0" />
            )}
            <span>Transaction intent confirmed</span>
          </button>

          <button
            type="button"
            id="checklist-device-verified"
            onClick={() => toggleChecklist('deviceVerified')}
            className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
              checklist.deviceVerified
                ? 'bg-[#15231c] border-emerald-600/40 text-emerald-200'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            {checklist.deviceVerified ? (
              <CheckSquare className="w-4 h-4 text-[#44ff44] shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#555] shrink-0" />
            )}
            <span>Device/IP verified</span>
          </button>

          <button
            type="button"
            id="checklist-mfa-reviewed"
            onClick={() => toggleChecklist('mfaReviewed')}
            className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
              checklist.mfaReviewed
                ? 'bg-[#15231c] border-emerald-600/40 text-emerald-200'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            {checklist.mfaReviewed ? (
              <CheckSquare className="w-4 h-4 text-[#44ff44] shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#555] shrink-0" />
            )}
            <span>Multi-factor authentication reviewed</span>
          </button>
        </div>
      </div>

      {/* Decision Radio Selection */}
      <div className="space-y-2 pt-2 border-t border-[#222222]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b0b0b0]">
            Investigator Decision:
          </span>
          <span className="text-[10px] text-[#777]">Final Disposition</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* CLEAR */}
          <label
            htmlFor="decision-clear"
            className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors ${
              decision === 'CLEAR'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-[#44ff44] shadow-xs'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            <input
              type="radio"
              id="decision-clear"
              name="investigator-decision"
              value="CLEAR"
              checked={decision === 'CLEAR'}
              onChange={() => setDecision('CLEAR')}
              className="accent-[#44ff44] cursor-pointer"
            />
            <div>
              <span className="block font-bold">CLEAR</span>
              <span className="text-[10px] text-[#777] font-normal block">
                No suspicious activity
              </span>
            </div>
          </label>

          {/* INVESTIGATE */}
          <label
            htmlFor="decision-investigate"
            className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors ${
              decision === 'INVESTIGATE'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-xs'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            <input
              type="radio"
              id="decision-investigate"
              name="investigator-decision"
              value="INVESTIGATE"
              checked={decision === 'INVESTIGATE'}
              onChange={() => setDecision('INVESTIGATE')}
              className="accent-amber-400 cursor-pointer"
            />
            <div>
              <span className="block font-bold">INVESTIGATE</span>
              <span className="text-[10px] text-[#777] font-normal block">
                Requires further review
              </span>
            </div>
          </label>

          {/* ESCALATE */}
          <label
            htmlFor="decision-escalate"
            className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors ${
              decision === 'ESCALATE'
                ? 'bg-red-950/40 border-red-500/50 text-[#ff6666] shadow-xs'
                : 'bg-[#111111] border-[#262626] text-[#888] hover:border-[#383838]'
            }`}
          >
            <input
              type="radio"
              id="decision-escalate"
              name="investigator-decision"
              value="ESCALATE"
              checked={decision === 'ESCALATE'}
              onChange={() => setDecision('ESCALATE')}
              className="accent-[#ff4444] cursor-pointer"
            />
            <div>
              <span className="block font-bold">ESCALATE</span>
              <span className="text-[10px] text-[#777] font-normal block">
                Refer to senior investigator
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Buttons Row: [Save Notes] [Print Report] [Export PDF] + [Archive Report] */}
      <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center gap-2.5">
        <button
          id="save-notes-btn"
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#262626] hover:bg-[#323232] text-white border border-[#3d3d3d] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5 text-blue-400" />
          Save Notes
        </button>

        {onSaveAndReturn && (
          <button
            id="save-and-return-btn"
            type="button"
            onClick={handleSaveAndReturn}
            className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Save notes and return to Dashboard to select next customer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Save &amp; Return to Dashboard
          </button>
        )}

        <button
          id="print-report-btn"
          type="button"
          onClick={onPrint}
          className="px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#1a2333] hover:bg-[#202c40] text-blue-300 border border-blue-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Report
        </button>

        <button
          id="export-pdf-report-btn"
          type="button"
          onClick={onExportPdf}
          className="px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#1a2333] hover:bg-[#202c40] text-blue-300 border border-blue-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </button>

        {(isCleanCase || decision === 'CLEAR') && (
          <button
            id="archive-report-btn"
            type="button"
            onClick={handleArchive}
            disabled={isArchived}
            className="ml-auto px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-[#44ff44] border border-emerald-700/50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            {isArchived ? 'Report Archived' : 'Archive Report'}
          </button>
        )}
      </div>
    </section>
  );
};
