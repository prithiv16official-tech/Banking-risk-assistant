export interface Transaction {
  id: number;
  date: string;
  amount: number;
  payee: string;
  channel: 'online' | 'transfer' | 'debit_card';
  description: string;
  notes?: string;
  timeNote?: string;
  isNewPayee?: boolean;
}

export interface CustomerProfile {
  id: string;
  caseId: string;
  name: string;
  bankName?: string;
  accountNumber: string;
  accountType: string;
  averageTransaction: number;
  monthlyIncome: number;
  riskRating: 'High' | 'Medium' | 'Low' | 'None';
  reviewStatus: 'PENDING INVESTIGATION' | 'COMPLETE';
  generatedAt: string;
  transactions: Transaction[];
}

export interface RiskRule {
  id: string; // e.g. "R001"
  name: string;
  category: string;
  description: string;
  thresholdText: string;
}

export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  triggeredTxIds: number[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'NONE';
  explanation: string;
  conditionDetails: string;
  investigatorFocus: string;
}

export interface InvestigationSummaryData {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  riskScore?: number;
  totalOutgoingRiskAmount: number;
  rulesTriggeredCount: number;
  primaryConcern: string;
  findings: string[];
  ruleEvaluations: RuleEvaluation[];
  recommendation: string[];
  aiExplanation?: string;
  aiSource?: string;
  dataQuality: {
    completeHistory: boolean;
    baselineReliable: boolean;
    allIndicatorsEvaluated: boolean;
  };
}

export interface DatasetValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
  warnings: string[];
  detectedBaseline: number;
  dateRange: { start: string; end: string };
  totalVolume: number;
  transactions: Transaction[];
}

export type InvestigatorDecision = 'CLEAR' | 'INVESTIGATE' | 'ESCALATE' | null;

export interface InvestigatorChecklist {
  customerContacted: boolean;
  intentConfirmed: boolean;
  deviceVerified: boolean;
  mfaReviewed: boolean;
}

export interface CaseInvestigatorData {
  notes: string;
  checklist: InvestigatorChecklist;
  decision: InvestigatorDecision;
  assignedInvestigator: string;
  lastSaved?: string;
}
