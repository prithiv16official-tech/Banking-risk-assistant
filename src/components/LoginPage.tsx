import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { INVESTIGATOR_OPTIONS } from '../data';

interface Props {
  currentInvestigator: string;
  onLogin: (investigatorName: string) => void;
  onSkip: () => void;
}

export const LoginPage: React.FC<Props> = ({
  currentInvestigator,
  onLogin,
  onSkip,
}) => {
  const [selectedInvestigator, setSelectedInvestigator] = useState(currentInvestigator || INVESTIGATOR_OPTIONS[0]);
  const [customName, setCustomName] = useState('');
  const [pin, setPin] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCustom && customName.trim() ? customName.trim() : selectedInvestigator;
    onLogin(finalName);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-xl text-blue-400 mb-2">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#2c2c2c] text-[11px] font-mono text-[#a0a0a0]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PS06 COMPLIANCE WORKBENCH
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Transaction Risk Analysis Portal
          </h1>
          <p className="text-xs text-[#808080] max-w-sm mx-auto">
            Banking Fraud &amp; AML Risk Heuristics Workbench for authorized compliance investigators.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Investigator Sign-In
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#1e293b] text-blue-300 font-medium">
              Optional Step
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Profile Selection */}
            <div className="space-y-2">
              <label htmlFor="investigator-select" className="text-xs font-semibold text-[#b0b0b0] block">
                Select Active Investigator:
              </label>
              
              {!isCustom ? (
                <div className="space-y-2">
                  <select
                    id="investigator-select"
                    value={selectedInvestigator}
                    onChange={(e) => setSelectedInvestigator(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] text-white text-xs rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium cursor-pointer"
                  >
                    {INVESTIGATOR_OPTIONS.map((inv) => (
                      <option key={inv} value={inv} className="bg-[#141414] text-white">
                        {inv}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Enter custom name / badge ID
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    id="custom-investigator-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. J. Doe (Lead AML Specialist)"
                    className="w-full bg-[#181818] border border-[#333] text-white text-xs rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustom(false)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ← Choose from standard directory
                  </button>
                </div>
              )}
            </div>

            {/* Optional PIN / Passcode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="investigator-pin" className="text-xs font-semibold text-[#b0b0b0]">
                  Security PIN / Token:
                </label>
                <span className="text-[10px] text-[#666]">Optional</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="investigator-pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••••• (Leave blank or enter any PIN)"
                  className="w-full bg-[#181818] border border-[#333] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 placeholder-[#555] focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-[#666] absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                id="login-submit-btn"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
              >
                <span>Sign In &amp; Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="skip-login-btn"
                onClick={onSkip}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-[#b0b0b0] hover:text-white border border-[#2e2e2e] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Continue to Dashboard as Guest (Skip Login)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#777]" />
              </button>
            </div>
          </form>

          {/* Optional notice */}
          <div className="pt-3 border-t border-[#222222] text-center">
            <p className="text-[11px] text-[#666] leading-relaxed">
              Authentication is completely optional in this workbench. You can jump directly into analyzing customers or sign in with your analyst credentials.
            </p>
          </div>
        </div>

        {/* Security / System Footer */}
        <div className="text-center text-[11px] text-[#555] flex items-center justify-center gap-2">
          <span>Non-discretionary heuristics engine v2.4</span>
          <span>&bull;</span>
          <span>PS06 Compliant</span>
        </div>
      </div>
    </div>
  );
};
