import React from 'react';
import { Transaction, RuleEvaluation } from '../types';
import { X, AlertTriangle, ShieldCheck, Calendar, DollarSign, Tag, Clock, Globe } from 'lucide-react';

interface Props {
  transaction: Transaction | null;
  averageAmount: number;
  evaluations: RuleEvaluation[];
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<Props> = ({
  transaction,
  averageAmount,
  evaluations,
  onClose,
}) => {
  if (!transaction) return null;

  const triggeredRules = evaluations.filter(
    (e) => e.triggered && e.triggeredTxIds.includes(transaction.id)
  );
  const ratio = (transaction.amount / averageAmount).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#161616] rounded-xl shadow-2xl border border-[#2a2a2a] max-w-lg w-full overflow-hidden text-[#e0e0e0]">
        {/* Header */}
        <div className="p-4 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#242424] text-white border border-[#383838]">
              Tx #{transaction.id}
            </span>
            <h3 className="text-sm font-bold text-white">Transaction Risk Parameter Detail</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808080] hover:text-white hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Main metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-[#2a2a2a]">
              <span className="text-[#808080] text-[11px] uppercase tracking-wider font-semibold block">Amount</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                ${transaction.amount.toLocaleString()}
              </span>
              <span className="text-[11px] text-red-400 font-semibold block mt-0.5 font-mono">
                {ratio}x avg (${averageAmount.toLocaleString()})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-[#2a2a2a]">
              <span className="text-[#808080] text-[11px] uppercase tracking-wider font-semibold block">Payee</span>
              <span className="text-sm font-bold text-white block truncate mt-0.5" title={transaction.payee}>
                {transaction.payee}
              </span>
              {transaction.isNewPayee && (
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  NEW PAYEE RECORD
                </span>
              )}
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2 border-t border-b border-[#222222] py-3">
            <div className="flex justify-between py-1">
              <span className="text-[#808080]">Posting Date:</span>
              <span className="font-mono text-[#e0e0e0] font-semibold">{transaction.date}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#808080]">Channel / Protocol:</span>
              <span className="font-medium text-[#e0e0e0] capitalize">{transaction.channel}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#808080]">Merchant Category:</span>
              <span className="font-medium text-[#e0e0e0]">{transaction.description}</span>
            </div>
            {transaction.timeNote && (
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#808080]">Velocity Context:</span>
                <span className="font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[11px]">
                  {transaction.timeNote}
                </span>
              </div>
            )}
            {transaction.notes && (
              <div className="flex justify-between py-1">
                <span className="text-[#808080]">Internal Memo:</span>
                <span className="text-[#c0c0c0]">{transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Triggered rules on this transaction */}
          <div>
            <h4 className="font-bold text-white mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Risk Rules Triggered by this Transaction ({triggeredRules.length})
            </h4>

            {triggeredRules.length === 0 ? (
              <p className="text-[#606060] italic p-3 rounded-lg bg-[#0e0e0e] border border-[#2a2a2a]">
                No automated risk rules were tripped by this transaction. Normal baseline activity.
              </p>
            ) : (
              <div className="space-y-2">
                {triggeredRules.map((rule) => (
                  <div
                    key={rule.ruleId}
                    className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[#e0e0e0]"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className="font-mono text-[11px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                        {rule.ruleId}
                      </span>
                      <span className="text-white text-xs">{rule.ruleName}</span>
                    </div>
                    <p className="text-[11px] text-red-300/90 mt-1 leading-relaxed">
                      {rule.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-[#e0e0e0] rounded-lg font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
