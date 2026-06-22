import React, { useEffect, useState } from 'react';
import { getCarbonIntelligence } from '../api';
import type { CarbonMetrics } from '../types';
import {
  AlertTriangle,
  Leaf,
  TrendingDown,
  Activity,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const CarbonTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<CarbonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getCarbonIntelligence();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load Carbon Tracking and Lifecycle metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
          <span className="text-muted text-sm font-medium">Computing carbon offset indices...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-8 text-center animate-fadeIn">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
        <p className="font-semibold text-error mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 px-5 py-2 text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Scope Emissions',
      'Scope 1 Offset': metrics.scope_1_saved_tonnes,
      'Scope 3 Grid Add': metrics.scope_3_added_tonnes,
      'Net Saved': metrics.net_co2_saved_tonnes,
    },
  ];

  const electrificationProgress = metrics.progress_percent;
  const chartTooltipStyle = {
    backgroundColor: '#181715',
    borderColor: '#252320',
    color: '#faf9f5',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '8px 12px',
    border: '1px solid #252320',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Net CO2 Offset</span>
            <Leaf className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-success" style={{ letterSpacing: '-0.5px' }}>
            {metrics.net_co2_saved_tonnes.toFixed(1)} tCO2e/yr
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Scope 1 Offset minus Scope 3 Charging</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Scope 1 Offset</span>
            <TrendingDown className="h-5 w-5 text-accent-teal" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>
            {metrics.scope_1_saved_tonnes.toFixed(1)} tCO2e/yr
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Direct diesel tailpipe displaced</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Scope 3 Additions</span>
            <AlertTriangle className="h-5 w-5 text-error" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>
            {metrics.scope_3_added_tonnes.toFixed(1)} tCO2e/yr
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Charging &amp; manufacturing footprint</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Target Progress</span>
            <Activity className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>
            {electrificationProgress.toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">
            {metrics.current_ev_count} EV / {metrics.target_ev_count} Target (30%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-surface-dark p-6 lg:col-span-1 space-y-6 animate-slideUp stagger-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-on-dark" style={{ letterSpacing: '-0.3px' }}>Lifecycle Carbon Balance</h3>
            <p className="text-xs text-on-dark-soft mt-1.5 leading-relaxed">
              Tailpipe offsets (Scope 1) vs upstream indirect emissions (Scope 3) generated by the electric grid charging fuel.
            </p>
          </div>

          <div className="h-60 w-full rounded-lg bg-surface-dark-soft/40 p-3 border border-surface-dark-elevated">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#6c6a64" fontSize={10} hide />
                <YAxis stroke="#6c6a64" fontSize={9} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#a09d96' }} />
                <Bar dataKey="Scope 1 Offset" fill="#5db872" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Scope 3 Grid Add" fill="#c64545" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Saved" fill="#5db8a6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-on-dark">
              <span>Overall Decarbonization Target</span>
              <span>{electrificationProgress.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-surface-dark-soft rounded-full h-3 overflow-hidden border border-surface-dark-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-teal to-success transition-all duration-1000 ease-out"
                style={{ width: `${electrificationProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-on-dark-soft leading-normal">
              Based on remaining ICE vehicles. Next transition batch targets mining loaders for maximum leverage.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-dark p-6 lg:col-span-2 space-y-4 animate-slideUp stagger-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-on-dark" style={{ letterSpacing: '-0.3px' }}>Electrification Triage Stack</h3>
            <p className="text-xs text-on-dark-soft mt-1">
              Conventional vehicles ranked by their carbon-saving potential when replaced by recommended EV models.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {metrics.top_candidates.map((cand, idx) => (
              <div
                key={cand.id}
                className="flex items-center justify-between rounded-lg border border-surface-dark-elevated bg-surface-dark-soft/30 p-3.5 hover:border-coral/30 transition-all duration-200 animate-slideInRight"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dark-elevated text-xs font-bold text-on-dark border border-surface-dark-soft">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-on-dark text-sm">{cand.id}</span>
                      <span className="text-[10px] text-on-dark-soft">&bull; {cand.type}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-success mt-0.5">
                      <Zap className="mr-1 h-3 w-3" />
                      Suitability: {cand.readiness_score}/100
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-5">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-on-dark-soft tracking-wider">CO2 Impact</p>
                    <p className="text-sm font-semibold text-success mt-0.5">
                      -{cand.co2_saved.toFixed(1)} t/yr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-on-dark-soft tracking-wider">TCO Delta</p>
                    <p className="text-sm font-semibold text-accent-teal mt-0.5">
                      -${(cand.tco_delta / 1000).toFixed(0)}k/yr
                    </p>
                  </div>
                  <button className="flex items-center justify-center rounded-lg bg-surface-dark-elevated hover:bg-coral hover:text-white text-on-dark-soft p-2 transition-all duration-200 border border-surface-dark-soft">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-surface-dark-soft/40 p-4 border border-surface-dark-elevated flex items-center justify-between text-sm">
            <span className="text-on-dark-soft text-xs">Ready to initiate procurement RFPs?</span>
            <button className="rounded-lg bg-coral hover:bg-coral-active text-white px-4 py-2 text-xs font-semibold transition-colors duration-200">
              Launch Fleet Replacement RFP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
