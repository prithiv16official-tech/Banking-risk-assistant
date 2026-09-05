import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Risk Explanation endpoint using Gemini
app.post('/api/ai-explain', async (req, res) => {
  try {
    const { customer, summary } = req.body;

    if (!customer || !summary) {
      return res.status(400).json({ error: 'Customer and summary data are required.' });
    }

    const ai = getGenAI();

    // If Gemini API Key is available, use gemini-3.8-flash
    if (ai) {
      const prompt = `You are a senior banking anti-fraud intelligence and AML forensic analyst operating under PS06 compliance guidelines.
Your role is to provide objective, non-discretionary risk explanations for an investigator. You do not make automated account freezes or file regulatory reports; you report analytical findings clearly for human investigator decisions.

Customer Information:
- Customer ID: ${customer.id}
- Customer Name: ${customer.name}
- Bank Name: ${customer.bankName || 'Partner Financial Institution'}
- Account Number: ${customer.accountNumber}
- Account Type: ${customer.accountType}
- Baseline Average Transaction: $${Number(customer.averageTransaction || 0).toLocaleString()}
- Total Transactions Analyzed: ${customer.transactions?.length || 0}

Heuristic Risk Findings:
- Overall Risk Level: ${summary.riskLevel}
- Risk Score: ${summary.riskScore ?? 'N/A'}/100
- Rules Triggered: ${summary.rulesTriggeredCount} of 5
- Primary Anomaly Concern: ${summary.primaryConcern}
- Total Outgoing Risk Amount: $${Number(summary.totalOutgoingRiskAmount || 0).toLocaleString()}

Specific Rules Evaluated:
${(summary.ruleEvaluations || [])
  .map(
    (r: any) =>
      `- Rule [${r.ruleId}] ${r.ruleName}: ${r.triggered ? 'TRIGGERED (HIGH)' : 'CLEARED (NONE)'} -> ${r.explanation}`
  )
  .join('\n')}

Transaction History Ledger Sample:
${(customer.transactions || [])
  .slice(0, 15)
  .map(
    (t: any) =>
      `Tx #${t.id}: ${t.date} | $${Number(t.amount).toLocaleString()} | Payee: ${t.payee} | Channel: ${t.channel} | Notes: ${t.notes || t.timeNote || 'None'}`
  )
  .join('\n')}

Provide an executive forensic report containing:
1. Executive Narrative: A 2-3 sentence executive synopsis of whether the account activity exhibits authentic human habits or acute departure indicating potential mule activity, account takeover, crypto drain, or smurfing.
2. Forensic Key Factors: 3-4 concise bullet points detailing specific transaction velocity, deviation from baseline average, and beneficiary risk.
3. Investigator Next Steps: 2-3 actionable verification recommendations (e.g. out-of-band verification, session IP telemetry audit, beneficiary categorization).

Keep the tone calm, professional, and precise. Return clean markdown formatted text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const explanation = response.text || '';
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        explanation,
      });
    }

    // Fallback heuristic explanation if no API key is set
    const highRisk = summary.riskLevel === 'HIGH' || summary.rulesTriggeredCount > 0;
    const fallbackText = highRisk
      ? `### Forensic Risk Assessment
Customer ${customer.name} (${customer.id}) demonstrates significant account anomalies departing from their historical baseline ($${Number(
          customer.averageTransaction
        ).toLocaleString()}). 

#### Key Risk Factors
- **Volume Outlier**: Outbound transfers totaling $${Number(
          summary.totalOutgoingRiskAmount
        ).toLocaleString()} significantly exceed typical ticket sizes.
- **Rule Violations**: ${summary.rulesTriggeredCount} non-discretionary risk indicator(s) triggered, led by **${
          summary.primaryConcern
        }**.
- **Velocity & Destination**: Beneficiary interaction pattern suggests potential external inducement or account compromise.

#### Investigator Guidance
1. Perform out-of-band identity and intent verification with the account holder.
2. Review device authorization tokens, IP geolocations, and recent credentials changes.
3. Determine whether transactions warrant internal disposition as INVESTIGATE or ESCALATE.`
      : `### Baseline Verification Summary
Customer ${customer.name} (${customer.id}) demonstrates routine financial behavior consistent with standard consumer spending.

#### Key Factors
- **Baseline Alignment**: All disbursements conform to the established average ($${Number(
          customer.averageTransaction
        ).toLocaleString()}).
- **No Anomalies**: Zero non-discretionary risk rules triggered across rapid succession, odd hours, payee burst, or large transfer thresholds.
- **Beneficiary Trust**: All payees reflect verified routine household categories.

#### Investigator Guidance
- Standard account status; recommend marking case as **CLEAR** for routine audit archive.`;

    return res.json({
      success: true,
      source: 'heuristic-engine',
      explanation: fallbackText,
    });
  } catch (error: any) {
    console.error('Error generating AI explanation:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate AI explanation',
      fallback: `Analysis completed via automated heuristics engine: ${
        req.body?.summary?.findings?.join('; ') || 'Review ledger.'
      }`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Risk Investigation Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
