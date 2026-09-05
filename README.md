TRACK_ID=PS06

# Transaction Risk Analysis Portal

Banking Fraud & AML Risk Heuristics Workbench for authorized compliance investigators.

## What It Does

A fraud investigation assistant for a bank's fraud desk. Analyzes customer transaction histories against 5 core risk rules and produces investigation reports with full citations and investigator guidance. The system reports findings; the investigator makes the decision.

## How to Run

```bash
pip install -r requirements.txt
python app.py
```

Opens on http://localhost:8000

## Environment

- Set `GEMINI_API_KEY` environment variable with your Gemini API key
- No other external APIs used

## Sample Data

Generated 3 test customer profiles:
- **CUST001 (Alex Vance)** - HIGH RISK (crypto fraud pattern)
- **CUST002 (Sarah Jenkins)** - CLEAN (no flags)
- **CUST003 (Marcus Brady)** - ESCALATE (complex case)

Each has 8-25 transactions over 3 months.

## Risk Rules Implemented

- **R001** - Unusually Large Transfer (>2x baseline)
- **R002** - New Payee Burst (3+ txns in 7 days)
- **R003** - Odd Hours Activity (11 PM - 5 AM)
- **R004** - Pattern Break (unusual payee types)
- **R005** - Rapid Succession (2+ large in 1 hour)

## Architecture

### Backend (Python Flask)
- `app.py` - Main server, Gemini integration
- Loads customer data at startup
- API endpoints: `/api/customers`, `/api/analyze/<customer_id>`

### Frontend (React TypeScript)
- Customer selector
- Full analysis report
- Investigator notes section
- Decision recording
- Export/Print capabilities

## Key Features

✓ Personalized baselines (not static thresholds)
✓ Multi-rule analysis (reduces false positives)
✓ Full citation of findings (every Tx number cited)
✓ LLM reasoning (adapts to novel patterns)
✓ Investigator empowerment (system reports, human decides)
✓ No auto-accusations (never states fraud, only flags)

## Problem Understanding

This system solves 6 major drawbacks of legacy fraud detection:
1. Static thresholds → Personalized baselines per customer
2. Alert fatigue → Multi-rule conjunction (fewer false positives)
3. Fixed rules → LLM reasoning (adapts to novel fraud)
4. Generic analysis → Customer-centric (compared to their history)
5. Black box → Full explainability (cites every finding)
6. High maintenance → No rule rewrites (LLM handles novelty)