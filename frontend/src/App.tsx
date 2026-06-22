import { useState } from 'react';
import { FleetAPM } from './components/FleetAPM';
import { ElectrificationPlanner } from './components/ElectrificationPlanner';
import { SupplyChain } from './components/SupplyChain';
import { CarbonTracker } from './components/CarbonTracker';
import { CopilotSidebar } from './components/CopilotSidebar';
import {
  Activity,
  Zap,
  Layers,
  Leaf,
  Sparkles,
} from 'lucide-react';

type Tab = 'fleet' | 'planner' | 'supply' | 'carbon';

const SpikeMark = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
    <path d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z" fill="#cc785c"/>
    <circle cx="10" cy="10" r="2" fill="#faf9f5"/>
  </svg>
);

const tabs: { id: Tab; name: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'fleet', name: 'EV APM & Telemetry', icon: Activity, desc: 'BMS battery degradation, temperature, & remaining useful life' },
  { id: 'planner', name: 'Electrification Scorer', icon: Zap, desc: 'ICE fleet suitability & lifetime TCO assessment' },
  { id: 'supply', name: 'Supply Chain Resiliency', icon: Layers, desc: 'Multi-tier supplier risk & quality deviation tracing' },
  { id: 'carbon', name: 'Carbon Lifecycle', icon: Leaf, desc: 'Scope 1 offsets, Scope 3 charging footprint, & transition roadmap' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('fleet');
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-surface-dark border-b border-surface-dark-elevated sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <SpikeMark />
                <h1 className="font-serif text-xl font-semibold text-on-dark tracking-tight my-0" style={{ letterSpacing: '-0.5px' }}>VoltIQ</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCopilotOpen(true)}
                className="flex items-center space-x-2 rounded-lg bg-coral hover:bg-coral-active text-white px-4 py-2 text-xs font-semibold transition-all duration-200 animate-pulse-glow"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ask VoltIQ Copilot</span>
              </button>
            </div>
          </div>

          <nav className="flex -mb-px space-x-1" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'border-coral text-on-dark bg-surface-dark-elevated/50'
                      : 'border-transparent text-on-dark-soft hover:text-on-dark hover:border-surface-dark-elevated'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-coral' : ''}`} />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="animate-fadeIn" key={activeTab}>
          {activeTab === 'fleet' && <FleetAPM />}
          {activeTab === 'planner' && <ElectrificationPlanner />}
          {activeTab === 'supply' && <SupplyChain />}
          {activeTab === 'carbon' && <CarbonTracker />}
        </div>
      </div>

      <CopilotSidebar isOpen={copilotOpen} setIsOpen={setCopilotOpen} />

      <footer className="bg-surface-dark border-t border-surface-dark-elevated py-6 text-center">
        <p className="text-on-dark-soft text-xs font-medium" style={{ letterSpacing: '0.3px' }}>
          &copy; 2026 VoltIQ Intelligence. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
