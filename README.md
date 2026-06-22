# VoltIQ — AI Asset Performance & Supply Chain Intelligence

VoltIQ is an agentic AI intelligence platform built for the **ET AI Hackathon 2026 (Problem Statement 3: Industrial EV Supply Chain & Asset Intelligence)**. It addresses heavy industrial EV fleet operational intelligence (battery health, charging, predictive maintenance) and multi-tier EV battery material supply chain risk management.

---

## Technical Stack & Architecture

- **Backend**: FastAPI (Python 3.14+), SQLite (via SQLAlchemy ORM), NumPy (degradation curve regression models), SlowAPI (rate-limiting).
- **Frontend**: React (TypeScript + Vite), Tailwind CSS v4 (styling), Recharts (data visualization), Lucide React (icons).
- **AI Agent**: Anthropic Claude 3.5 Sonnet integrations with dynamic tools schema execution (`get_fleet_health`, `get_supply_chain_risks`, `get_carbon_metrics`) and Server-Sent Events (SSE) streaming.

---

## Features

1. **EV APM & Telemetry**:
   - Dynamic battery capacity fade curve fitting via NumPy.
   - Remaining Useful Life (RUL) predictive scoring.
   - Anomaly Deviances detection ($> 2\sigma$) flagging temperature/voltage faults.
2. **Electrification Scorer**:
   - Custom suitability ranking of legacy ICE fleets (weights payload capacity, daily km, dwell times).
   - Lifetime Total Cost of Ownership (TCO) assessments (diesel displacement, grid charging, amortization).
3. **Supply Chain Resiliency Graph**:
   - Fully interactive custom SVG Node-Edge directed flow visualizer mapping Tier 1 (OEM) down to Tier 3 (mining deposits).
   - Geopolitical risk calculations (HHI Concentration Index) overlays.
   - Quality deviation tracer (chemistry impurities propagation).
4. **Carbon Tracker**:
   - Scope 1 direct tailpipe offset projections.
   - Scope 3 charging grid footprint additions.
   - Decarbonization priority queuing.
5. **Conversational Copilot**:
   - Domain-grounded Claude 3.5 Assistant.
   - SSE real-time streaming queries.
   - Multi-tool calling workflow.

---

## Setup & Execution

### Prerequisites
- Python 3.12+ (tested with 3.14)
- Node.js v20+ / npm v10+

### Step 1: Environment Configurations
Create a `.env` file in the root `voltiq` directory (duplicate `.env.example`):
```ini
# Add your Anthropic Claude API key to enable Conversational Copilot
ANTHROPIC_API_KEY=your-actual-api-key-here

DATABASE_URL=sqlite:///./voltiq.db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=127.0.0.1
PORT=8000
```

### Step 2: Install & Seed Backend
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Seed the database with simulated BMS telemetry, ICE fleets, and 3-tier supplier graph:
   ```bash
   python data/generators/db_seeder.py
   ```
3. Run the backend server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Step 3: Install & Start Frontend
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.

---

## Quick Start (Windows)
Double-click `start.bat` in the `voltiq` root folder. It will:
1. Verify Python & Node.js environments.
2. Install dependencies.
3. Automatically seed the SQLite database if not present.
4. Launch both the backend API and the Vite React frontend in separate terminal windows.
