import React, { useEffect, useState } from 'react';
import { getElectrificationPlan } from '../api';
import type { ICEVehicle } from '../types';
import {
  AlertTriangle,
  Zap,
  ShieldCheck,
  CheckCircle,
  DollarSign,
  Leaf,
} from 'lucide-react';

export const ElectrificationPlanner: React.FC = () => {
  const [vehicles, setVehicles] = useState<ICEVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof ICEVehicle>('readiness_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const data = await getElectrificationPlan();
      setVehicles(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch conventional fleet electrification assessment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof ICEVehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let valA = a[sortField] ?? 0;
    let valB = b[sortField] ?? 0;

    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    } else {
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }
  });

  const sortIndicator = (field: keyof ICEVehicle) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' \u2191' : ' \u2193';
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
          <span className="text-muted text-sm font-medium">Analyzing conventional fleet operations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-8 text-center animate-fadeIn">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
        <p className="font-semibold text-error mb-4">{error}</p>
        <button
          onClick={fetchPlan}
          className="rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 px-5 py-2 text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalSavings = vehicles.reduce((acc, v) => acc + (v.tco_delta || 0), 0);
  const totalCO2Saved = vehicles.reduce((acc, v) => acc + (v.co2_saved || 0), 0);
  const highlyReady = vehicles.filter((v) => (v.readiness_score || 0) >= 80).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Immediate EV Candidates</span>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>{highlyReady} / {vehicles.length}</p>
          <p className="mt-1 text-xs text-on-dark-soft">Readiness Score &gt;= 80 (high ROI &amp; dwell time)</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Cumulative TCO Delta</span>
            <DollarSign className="h-5 w-5 text-accent-teal" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-success" style={{ letterSpacing: '-0.5px' }}>
            {totalSavings >= 0 ? `-$${(totalSavings / 1000).toFixed(0)}k` : `+$${(Math.abs(totalSavings) / 1000).toFixed(0)}k`}
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Estimated lifetime fuel &amp; maintenance savings</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Scope 1 Offset Potential</span>
            <Leaf className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>{(totalCO2Saved).toFixed(0)} tCO2e/yr</p>
          <p className="mt-1 text-xs text-on-dark-soft">Direct emission reduction upon electrification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-xl bg-surface-dark p-5 lg:col-span-3 animate-slideUp stagger-4">
          <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
            <h3 className="font-serif text-lg font-semibold text-on-dark" style={{ letterSpacing: '-0.3px' }}>Electrification Suitability Assessor</h3>
            <p className="text-xs text-on-dark-soft mt-1 sm:mt-0">
              *TCO includes infrastructure amortization, battery replacements, and electricity prices.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-dark-elevated text-xs uppercase text-on-dark-soft">
                  <th onClick={() => handleSort('id')} className="cursor-pointer px-4 py-3 hover:text-on-dark font-semibold tracking-wider transition-colors">
                    Vehicle ID{sortIndicator('id')}
                  </th>
                  <th onClick={() => handleSort('type')} className="cursor-pointer px-4 py-3 hover:text-on-dark font-semibold tracking-wider transition-colors">
                    Type{sortIndicator('type')}
                  </th>
                  <th onClick={() => handleSort('daily_km')} className="cursor-pointer px-4 py-3 hover:text-on-dark font-semibold tracking-wider transition-colors">
                    Daily Dist. (km){sortIndicator('daily_km')}
                  </th>
                  <th onClick={() => handleSort('dwell_time_hours')} className="cursor-pointer px-4 py-3 hover:text-on-dark font-semibold tracking-wider transition-colors">
                    Depot Dwell (hr){sortIndicator('dwell_time_hours')}
                  </th>
                  <th onClick={() => handleSort('readiness_score')} className="cursor-pointer px-4 py-3 hover:text-on-dark font-semibold tracking-wider text-center transition-colors">
                    Readiness Score{sortIndicator('readiness_score')}
                  </th>
                  <th className="px-4 py-3 font-semibold tracking-wider">Recommended EV</th>
                  <th onClick={() => handleSort('tco_delta')} className="cursor-pointer px-4 py-3 text-right hover:text-on-dark font-semibold tracking-wider transition-colors">
                    TCO Delta{sortIndicator('tco_delta')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark-elevated">
                {sortedVehicles.map((v, i) => {
                  const score = v.readiness_score || 0;
                  return (
                    <tr key={v.id} className="transition-colors hover:bg-surface-dark-soft/30 animate-slideInRight" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-4 py-3 font-semibold text-on-dark">{v.id}</td>
                      <td className="px-4 py-3 text-on-dark-soft">{v.type}</td>
                      <td className="px-4 py-3 text-on-dark">{v.daily_km.toFixed(0)} km</td>
                      <td className="px-4 py-3 text-on-dark">{v.dwell_time_hours.toFixed(1)} hrs</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                          score >= 80
                            ? 'bg-success/15 text-success'
                            : score >= 60
                            ? 'bg-accent-amber/15 text-accent-amber'
                            : 'bg-error/15 text-error'
                        }`}>
                          {score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {v.recommended_ev ? (
                          <span className="flex items-center text-xs font-medium text-on-dark">
                            <Zap className="mr-1.5 h-3.5 w-3.5 text-accent-teal" />
                            {v.recommended_ev}
                          </span>
                        ) : (
                          <span className="text-on-dark-soft">-</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        v.tco_delta && v.tco_delta > 0 ? 'text-success' : 'text-error'
                      }`}>
                        {v.tco_delta
                          ? `${v.tco_delta > 0 ? '-' : '+'}$${Math.abs(v.tco_delta).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-1 animate-slideUp stagger-5">
          <div className="rounded-xl bg-surface-dark p-6">
            <h3 className="font-serif text-base font-semibold text-on-dark mb-3" style={{ letterSpacing: '-0.3px' }}>Triage Decision Strategy</h3>
            <p className="text-xs text-on-dark-soft leading-relaxed mb-5">
              Our suitability model weights daily mileage against depot dwell times. Vehicles with high daily runs and long breaks represent optimal electrification candidates.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-on-dark">Optimal TCO Transition</h4>
                  <p className="text-[11px] text-on-dark-soft mt-0.5">
                    High suitability indicates diesel displacement offsets infrastructure capex in &lt; 2.5 years.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-accent-teal/10 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-accent-teal" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-on-dark">Infrastructure Dwell Limit</h4>
                  <p className="text-[11px] text-on-dark-soft mt-0.5">
                    Vehicles with &lt; 3.0 hrs depot dwell times require high-power DC fast-charging setups.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-dark p-6 border border-coral/10">
            <h3 className="font-serif text-base font-semibold text-on-dark mb-3 flex items-center" style={{ letterSpacing: '-0.3px' }}>
              <Zap className="mr-2 h-4 w-4 text-coral" />
              Procurement Target
            </h3>
            <p className="text-xs text-on-dark-soft leading-relaxed mb-4">
              Based on the fleet profile, replacing the top 3 highest-scoring ICE vehicles yields:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-surface-dark-elevated">
                <span className="text-on-dark-soft">Annual Diesel Saved:</span>
                <span className="font-semibold text-on-dark">~45,000 Liters</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-surface-dark-elevated">
                <span className="text-on-dark-soft">Immediate Capital Cost:</span>
                <span className="font-semibold text-on-dark">$450,000</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-on-dark-soft">Annual OpEx Savings:</span>
                <span className="font-semibold text-success">+$38,400/yr</span>
              </div>
            </div>
            <button className="mt-5 w-full rounded-lg bg-coral hover:bg-coral-active text-white px-4 py-2.5 text-center text-xs font-semibold transition-colors duration-200">
              Generate RFP Specifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
