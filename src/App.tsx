import React, { useState, useMemo } from 'react';
import { CASES_LIST, RISK_RULES, INITIAL_INVESTIGATOR_DATA, INVESTIGATOR_OPTIONS } from './data';
import { evaluateCustomerRisk } from './utils/rulesEngine';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { CaseHeader } from './components/CaseHeader';
import { RulesList } from './components/RulesList';
import { InvestigationSummary } from './components/InvestigationSummary';
import { InvestigatorNotes } from './components/InvestigatorNotes';
import { TransactionLedger } from './components/TransactionLedger';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { TransactionUploader } from './components/TransactionUploader';
import { Transaction, CaseInvestigatorData, CustomerProfile } from './types';
import { ShieldCheck, CheckCircle2, ShieldAlert, ArrowLeft, Layers } from 'lucide-react';

type AppView = 'login' | 'dashboard' | 'analysis' | 'uploader';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [currentInvestigator, setCurrentInvestigator] = useState<string>(INVESTIGATOR_OPTIONS[0]);
  const [casesList, setCasesList] = useState<CustomerProfile[]>(CASES_LIST);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CUST001');
  const [investigatorDataMap, setInvestigatorDataMap] = useState<Record<string, CaseInvestigatorData>>(
    INITIAL_INVESTIGATOR_DATA
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active customer profile
  const currentCustomer = useMemo(() => {
    return casesList.find((c) => c.id === selectedCaseId) || casesList[0];
  }, [casesList, selectedCaseId]);

  // Automated heuristic evaluation
  const summary = useMemo(() => {
    return evaluateCustomerRisk(currentCustomer);
  }, [currentCustomer]);

  // Current investigator case data
  const currentInvestigatorData = useMemo(() => {
    return (
      investigatorDataMap[selectedCaseId] || {
        notes: '',
        checklist: {
          customerContacted: false,
          intentConfirmed: false,
          deviceVerified: false,
          mfaReviewed: false,
        },
        decision: null,
        assignedInvestigator: currentInvestigator,
      }
    );
  }, [investigatorDataMap, selectedCaseId, currentInvestigator]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogin = (investigatorName: string) => {
    setCurrentInvestigator(investigatorName);
    setCurrentView('dashboard');
    showToast(`Signed in as ${investigatorName}`);
  };

  const handleSkipLogin = () => {
    setCurrentView('dashboard');
    showToast('Entered Dashboard as Guest');
  };

  const handleAnalyzeFromDashboard = (customerId: string) => {
    setSelectedCaseId(customerId);
    setSelectedRuleId(null);
    setSelectedTx(null);
    setCurrentView('analysis');
    const customer = casesList.find((c) => c.id === customerId);
    showToast(`Loaded analysis findings for ${customer?.name || customerId}`);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setSelectedRuleId(null);
    setSelectedTx(null);
    showToast(`Switched to case: ${caseId}`);
  };

  const handleInvestigatorChange = (investigatorName: string) => {
    setCurrentInvestigator(investigatorName);
    setInvestigatorDataMap((prev) => ({
      ...prev,
      [selectedCaseId]: {
        ...prev[selectedCaseId],
        assignedInvestigator: investigatorName,
      },
    }));
    showToast(`Assigned to ${investigatorName}`);
  };

  const handleSaveInvestigatorData = (updatedData: CaseInvestigatorData) => {
    setInvestigatorDataMap((prev) => ({
      ...prev,
      [selectedCaseId]: updatedData,
    }));
    showToast('Investigator notes & disposition recorded successfully.');
  };

  const handleSaveAndReturnToDashboard = (updatedData: CaseInvestigatorData) => {
    setInvestigatorDataMap((prev) => ({
      ...prev,
      [selectedCaseId]: updatedData,
    }));
    setCurrentView('dashboard');
    showToast(`Case ${selectedCaseId} saved. Returned to Dashboard.`);
  };

  const handleCaseAnalyzedAndSaved = (
    newCustomer: CustomerProfile,
    newInvestigatorData: CaseInvestigatorData
  ) => {
    setCasesList((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === newCustomer.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = newCustomer;
        return copy;
      }
      return [newCustomer, ...prev];
    });

    setInvestigatorDataMap((prev) => ({
      ...prev,
      [newCustomer.id]: newInvestigatorData,
    }));

    setSelectedCaseId(newCustomer.id);
    setSelectedRuleId(null);
    setSelectedTx(null);
    setCurrentView('analysis');
    showToast(`Successfully analyzed and saved ${newCustomer.name} (${newCustomer.id})!`);
  };

  const handlePrint = () => {
    showToast('Preparing printable transaction risk analysis report...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleExportPdf = () => {
    showToast('Exporting case report to PDF via system print driver...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 1. LOGIN VIEW (OPTIONAL)
  if (currentView === 'login') {
    return (
      <LoginPage
        currentInvestigator={currentInvestigator}
        onLogin={handleLogin}
        onSkip={handleSkipLogin}
      />
    );
  }

  // 2. DASHBOARD VIEW
  if (currentView === 'dashboard') {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#181818] text-[#f0f0f0] px-4 py-3 rounded-xl shadow-2xl border border-[#333] text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#44ff44] shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <Dashboard
          customers={casesList}
          investigatorDataMap={investigatorDataMap}
          currentInvestigator={currentInvestigator}
          onAnalyzeCustomer={handleAnalyzeFromDashboard}
          onSwitchInvestigator={() => setCurrentView('login')}
          onOpenUploader={() => setCurrentView('uploader')}
        />
      </>
    );
  }

  // 3. TRANSACTION DATA UPLOADER VIEW
  if (currentView === 'uploader') {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#181818] text-[#f0f0f0] px-4 py-3 rounded-xl shadow-2xl border border-[#333] text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#44ff44] shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <TransactionUploader
          onCaseAnalyzedAndSaved={handleCaseAnalyzedAndSaved}
          onCancelOrBack={() => setCurrentView('dashboard')}
        />
      </>
    );
  }

  // 4. ANALYSIS FINDINGS VIEW
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#181818] text-[#f0f0f0] px-4 py-3 rounded-xl shadow-2xl border border-[#333] text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#44ff44] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Risk Heuristics Summary Strip with Return to Dashboard */}
      <CaseHeader
        customer={currentCustomer}
        summary={summary}
        availableCases={casesList}
        selectedCaseId={selectedCaseId}
        onSelectCase={handleSelectCase}
        investigator={currentInvestigatorData.assignedInvestigator || currentInvestigator}
        onInvestigatorChange={handleInvestigatorChange}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />

      {/* Main Investigation Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Grid: Rules Evaluation (Left) + Summary & Investigator Input (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Automated Rules Evaluation */}
          <div className="lg:col-span-6 space-y-6">
            <RulesList
              rules={RISK_RULES}
              evaluations={summary.ruleEvaluations}
              selectedRuleId={selectedRuleId}
              onSelectRule={setSelectedRuleId}
            />
          </div>

          {/* Right Column: System Summary + Investigator Notes */}
          <div className="lg:col-span-6 space-y-6">
            <InvestigationSummary
              customer={currentCustomer}
              summary={summary}
              onPrint={handlePrint}
              onExportPdf={handleExportPdf}
            />

            <InvestigatorNotes
              caseId={selectedCaseId}
              data={currentInvestigatorData}
              onSave={handleSaveInvestigatorData}
              onSaveAndReturn={handleSaveAndReturnToDashboard}
              onPrint={handlePrint}
              onExportPdf={handleExportPdf}
              isCleanCase={summary.riskLevel === 'NONE'}
            />
          </div>
        </div>

        {/* Bottom Section: Customer Transaction History Ledger */}
        <div className="pt-2">
          <TransactionLedger
            transactions={currentCustomer.transactions}
            averageAmount={currentCustomer.averageTransaction}
            evaluations={summary.ruleEvaluations}
            selectedRuleId={selectedRuleId}
            onClearRuleFilter={() => setSelectedRuleId(null)}
            onSelectTx={setSelectedTx}
            selectedTxId={selectedTx?.id ?? null}
          />
        </div>

        {/* Bottom Action Strip: Return to Dashboard to Select Next Customer */}
        <div className="pt-4 flex items-center justify-between border-t border-[#222222]">
          <button
            type="button"
            id="bottom-return-dashboard-btn"
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>&larr; Return to Dashboard (Select Next Customer)</span>
          </button>

          <span className="text-[11px] text-[#707070]">
            Case Reference: <strong className="font-mono text-[#aaa]">{currentCustomer.caseId}</strong>
          </span>
        </div>
      </main>

      {/* Transaction Parameter Detail Forensic Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        averageAmount={currentCustomer.averageTransaction}
        evaluations={summary.ruleEvaluations}
        onClose={() => setSelectedTx(null)}
      />

      {/* Footer */}
      <footer className="border-t border-[#222222] bg-[#0c0c0c] py-5 px-6 text-center text-xs text-[#666]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {summary.riskLevel === 'NONE' ? (
              <ShieldCheck className="w-4 h-4 text-[#44ff44]" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-[#ff4444]" />
            )}
            <span className="font-semibold text-[#888]">
              Transaction Risk Analysis Report System
            </span>
            <span>&bull;</span>
            <span className="font-mono text-[#777]">Case Reference #{currentCustomer.caseId}</span>
          </div>
          <span className="text-[#555]">
            Read-Only Analysis Feed &bull; Investigator Decision Authority &bull; PS06 Compliant
          </span>
        </div>
      </footer>
    </div>
  );
}
