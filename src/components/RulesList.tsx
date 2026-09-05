import React from 'react';
import { RiskRule, RuleEvaluation } from '../types';
import { AlertTriangle, CheckCircle2, TrendingUp, UserPlus, Clock, Zap, Eye, Filter } from 'lucide-react';

interface Props {
  rules: RiskRule[];
  evaluations: RuleEvaluation[];
  selectedRuleId: string | null;
  onSelectRule: (ruleId: string | null) => void;
}

export const RulesList: React.FC<Props> = ({
  rules,
  evaluations,
  selectedRuleId,
  onSelectRule,
}) => {
  const getRuleIcon = (id: string) => {
    switch (id) {
      case 'R001':
        return <TrendingUp className="w-4 h-4" />;
      case 'R002':
        return <UserPlus className="w-4 h-4" />;
      case 'R003':
        return <Clock className="w-4 h-4" />;
      case 'R004':
        return <Eye className="w-4 h-4" />;
      case 'R005':
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <section className="bg-[#161616] rounded-xl border border-[#2a2a2a] shadow-md p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            Automated Risk Rules Evaluation
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            Objective evaluation of transaction patterns against 5 standard banking risk heuristics.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded bg-[#1f1f1f] text-[#a0a0a0] border border-[#333]">
          Click rule to filter ledger
        </span>
      </div>

      <div className="space-y-3.5 mt-4">
        {rules.map((rule) => {
          const evalResult = evaluations.find((e) => e.ruleId === rule.id);
          const isTriggered = evalResult?.triggered ?? false;
          const isSelected = selectedRuleId === rule.id;

          return (
            <div
              key={rule.id}
              id={`rule-card-${rule.id}`}
              onClick={() => onSelectRule(isSelected ? null : rule.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-[#121c29] ring-1 ring-blue-500/50 shadow-md'
                  : isTriggered
                  ? 'border-red-500/40 bg-red-500/5 hover:border-red-500/60'
                  : 'border-[#262626] bg-[#111111] hover:border-[#3a3a3a]'
              }`}
            >
              {/* Header row of rule */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isTriggered
                        ? 'bg-red-500/15 text-[#ff4444] border border-red-500/30'
                        : 'bg-emerald-500/10 text-[#44ff44] border border-emerald-500/20'
                    }`}
                  >
                    {getRuleIcon(rule.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#222] text-white border border-[#383838]">
                        {rule.id}
                      </span>
                      <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                      <span className="text-xs text-[#808080] font-medium">
                        &bull; {rule.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#a8a8a8] mt-1">
                      <strong className="text-[#d0d0d0]">Condition:</strong> {rule.description}
                    </p>
                    <p className="text-[11px] text-[#666] font-mono mt-0.5">
                      Threshold: {rule.thresholdText}
                    </p>
                  </div>
                </div>

                <div>
                  {isTriggered ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-[#ff4444] border border-red-500/40 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff4444]" />
                      TRIGGERED ⚠️
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-[#44ff44] border border-emerald-500/30 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#44ff44]" />
                      NOT TRIGGERED ✅
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown for TRIGGERED vs NOT TRIGGERED */}
              {evalResult && (
                <div className="mt-3.5 pt-3 border-t border-[#222222] text-xs space-y-2">
                  {isTriggered ? (
                    /* Triggered state details */
                    <>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#ff8080] min-w-[135px]">
                          Transaction Numbers:
                        </span>
                        <span className="text-white font-medium">
                          {evalResult.triggeredTxIds.length > 0 ? (
                            <span className="inline-flex flex-wrap gap-1.5">
                              {evalResult.triggeredTxIds.map((id) => (
                                <span
                                  key={id}
                                  className="px-2 py-0.5 rounded bg-red-950/70 font-mono font-bold text-[#ff6666] border border-red-700/50"
                                >
                                  Tx #{id}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-[#888] italic">None</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#808080] min-w-[135px]">
                          Why Concerning:
                        </span>
                        <span className="text-[#d8d8d8] leading-relaxed">
                          {evalResult.explanation}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#808080] min-w-[135px]">
                          Investigator Focus:
                        </span>
                        <span className="text-blue-300 font-medium bg-[#121927] px-2.5 py-1.5 rounded-lg border border-blue-900/40 leading-relaxed">
                          {evalResult.investigatorFocus}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Not triggered state details */
                    <>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#66bb6a] min-w-[135px]">
                          Condition:
                        </span>
                        <span className="text-[#a0a0a0]">
                          {evalResult.conditionDetails || 'Activity falls within expected standard bounds.'}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#808080] min-w-[135px]">
                          Message:
                        </span>
                        <span className="text-[#44ff44] font-medium inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#44ff44]" />
                          No concerning activity for this rule
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#808080] min-w-[135px]">
                          Investigator Focus:
                        </span>
                        <span className="text-[#707070] italic">
                          {evalResult.investigatorFocus}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
