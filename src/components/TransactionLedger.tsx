import React, { useState, useMemo } from 'react';
import { Transaction, RuleEvaluation } from '../types';
import { CreditCard, Globe, ArrowDownLeft, AlertTriangle, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  averageAmount: number;
  evaluations: RuleEvaluation[];
  selectedRuleId: string | null;
  onClearRuleFilter: () => void;
  onSelectTx: (tx: Transaction | null) => void;
  selectedTxId: number | null;
}

type SortField = 'id' | 'date' | 'amount' | 'payee';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'FLAGGED' | 'CLEAN';

export const TransactionLedger: React.FC<Props> = ({
  transactions,
  averageAmount,
  evaluations,
  selectedRuleId,
  onClearRuleFilter,
  onSelectTx,
  selectedTxId,
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
            <Globe className="w-3 h-3" /> Online
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#40c057] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <ArrowDownLeft className="w-3 h-3" /> Transfer / Wire
          </span>
        );
      case 'debit_card':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            <CreditCard className="w-3 h-3" /> Debit Card
          </span>
        );
      default:
        return <span>{channel}</span>;
    }
  };

  // Check which rules triggered for a specific transaction
  const getTriggeredRulesForTx = (txId: number) => {
    return evaluations.filter((e) => e.triggered && e.triggeredTxIds.includes(txId));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#555] inline-block ml-1 opacity-70" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-400 inline-block ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-400 inline-block ml-1" />
    );
  };

  // Filter and sort items
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Status filter
    if (statusFilter === 'FLAGGED') {
      result = result.filter((tx) => getTriggeredRulesForTx(tx.id).length > 0);
    } else if (statusFilter === 'CLEAN') {
      result = result.filter((tx) => getTriggeredRulesForTx(tx.id).length === 0);
    }

    // Selected rule filter
    if (selectedRuleId) {
      result = result.filter((tx) =>
        getTriggeredRulesForTx(tx.id).some((r) => r.ruleId === selectedRuleId)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id - b.id;
      } else if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'payee') {
        comparison = a.payee.localeCompare(b.payee);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, evaluations, statusFilter, selectedRuleId, sortField, sortOrder]);

  const flaggedCount = transactions.filter((tx) => getTriggeredRulesForTx(tx.id).length > 0).length;
  const cleanCount = transactions.length - flaggedCount;

  return (
    <section className="bg-[#111111] rounded-xl border border-[#2a2a2a] shadow-md overflow-hidden">
      {/* Header with Filter Controls */}
      <div className="p-5 border-b border-[#2a2a2a] bg-[#141414] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Customer Transaction History Ledger</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#202020] text-[#a0a0a0] border border-[#333]">
              {transactions.length} Records
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            Customer Baseline Average: <span className="font-mono font-semibold text-[#40c057]">${averageAmount.toLocaleString()}</span> &bull; Heuristic 2x Threshold: ${(averageAmount * 2).toLocaleString()}
          </p>
        </div>

        {/* Filter Controls: All / Flagged / Clean + Rule Badge */}
        <div className="flex items-center flex-wrap gap-2.5">
          {selectedRuleId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-800/40 text-xs">
              <span>Filtered by: <strong>{selectedRuleId}</strong></span>
              <button
                onClick={onClearRuleFilter}
                className="hover:text-white p-0.5 rounded transition-colors"
                title="Clear rule filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center p-1 bg-[#1a1a1a] rounded-lg border border-[#333]">
            <button
              id="filter-all-btn"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[#2b2b2b] text-white shadow-xs'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              id="filter-flagged-btn"
              onClick={() => setStatusFilter('FLAGGED')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                statusFilter === 'FLAGGED'
                  ? 'bg-red-950/60 text-[#ff6666] border border-red-700/50 shadow-xs'
                  : 'text-[#888] hover:text-[#ff6666]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4444]" />
              Flagged ({flaggedCount})
            </button>
            <button
              id="filter-clean-btn"
              onClick={() => setStatusFilter('CLEAN')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                statusFilter === 'CLEAN'
                  ? 'bg-emerald-950/60 text-[#44ff44] border border-emerald-700/50 shadow-xs'
                  : 'text-[#888] hover:text-[#44ff44]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#44ff44]" />
              Clean ({cleanCount})
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#161616] border-b border-[#2a2a2a] text-[#808080] font-semibold uppercase tracking-wider text-[11px] select-none">
              <th
                onClick={() => handleSort('id')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                # {renderSortIcon('id')}
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Date {renderSortIcon('date')}
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Amount {renderSortIcon('amount')}
              </th>
              <th
                onClick={() => handleSort('payee')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Payee &amp; Context {renderSortIcon('payee')}
              </th>
              <th className="py-3.5 px-4">Channel</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Risk Evaluation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] font-medium">
            {processedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#666] italic">
                  No transactions match current filter criteria.
                </td>
              </tr>
            ) : (
              processedTransactions.map((tx) => {
                const triggeredRules = getTriggeredRulesForTx(tx.id);
                const isFlagged = triggeredRules.length > 0;
                const isSelected = selectedTxId === tx.id;
                const isDeposit =
                  tx.channel === 'transfer' &&
                  (tx.description.toLowerCase().includes('salary') ||
                    tx.description.toLowerCase().includes('payroll') ||
                    tx.payee.toLowerCase().includes('payroll') ||
                    tx.payee.toLowerCase().includes('salary'));

                const isLarge = tx.amount > averageAmount * 2 && !isDeposit;
                const ratioToAvg = (tx.amount / averageAmount).toFixed(1);

                return (
                  <tr
                    key={tx.id}
                    id={`transaction-row-${tx.id}`}
                    onClick={() => onSelectTx(isSelected ? null : tx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950/40 ring-1 ring-blue-500/50'
                        : isFlagged
                        ? 'bg-red-500/10 hover:bg-red-500/15 border-l-2 border-l-[#ff4444]'
                        : 'bg-[#101010]/60 hover:bg-[#181818]'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{tx.id}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-[#a0a0a0] whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div
                        className={`font-mono font-bold text-sm ${
                          isDeposit
                            ? 'text-[#44ff44]'
                            : isFlagged
                            ? 'text-[#ff6666]'
                            : 'text-white'
                        }`}
                      >
                        {isDeposit ? `+$${tx.amount.toLocaleString()}` : `$${tx.amount.toLocaleString()}`}
                      </div>
                      {isLarge && (
                        <span className="text-[10px] text-red-400 font-semibold font-mono block">
                          {ratioToAvg}x baseline avg
                        </span>
                      )}
                    </td>

                    {/* Payee */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{tx.payee}</span>
                        {tx.isNewPayee && (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                            New Payee
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-[#808080] font-normal mt-0.5">
                          {tx.notes}
                        </div>
                      )}
                      {tx.timeNote && (
                        <div className="text-[10px] text-orange-400 font-medium mt-0.5">
                          &bull; {tx.timeNote}
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getChannelBadge(tx.channel)}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-[#a0a0a0]">
                      <span className="px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-[11px]">
                        {tx.description}
                      </span>
                    </td>

                    {/* Risk Flags */}
                    <td className="py-3.5 px-4">
                      {isFlagged ? (
                        <div className="flex flex-wrap gap-1">
                          {triggeredRules.map((rule) => (
                            <span
                              key={rule.ruleId}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-[#ff4444] border border-red-500/30 font-mono"
                              title={rule.ruleName}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-[#ff4444]" />
                              {rule.ruleId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#44ff44] font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#44ff44]" />
                          Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Footer Summary */}
      <div className="p-4 bg-[#141414] border-t border-[#2a2a2a] text-xs text-[#808080] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff4444] inline-block"></span>
            <span>
              Flagged Transactions:{' '}
              <strong className="text-[#ff6666]">
                {flaggedCount} {flaggedCount === 1 ? 'transaction' : 'transactions'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#44ff44] inline-block"></span>
            <span>
              Routine Baseline:{' '}
              <strong className="text-[#a0a0a0]">
                {cleanCount} {cleanCount === 1 ? 'transaction' : 'transactions'}
              </strong>
            </span>
          </div>
        </div>
        <span className="text-[11px] text-[#606060]">
          Click any transaction row to inspect parameter breakdown
        </span>
      </div>
    </section>
  );
};
