import React, { useEffect, useState } from 'react';
import { getFleetHealth, getAssetTelemetry } from '../api';
import type { EVAsset } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  Battery,
  AlertTriangle,
  Calendar,
  TrendingDown,
  Wrench,
} from 'lucide-react';

export const FleetAPM: React.FC = () => {
  const [assets, setAssets] = useState<EVAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<EVAsset | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const data = await getFleetHealth();
      setAssets(data);
      if (data.length > 0) {
        handleSelectAsset(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError('Failed to load EV Fleet assets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = async (id: string) => {
    try {
      setTelemetryLoading(true);
      const detailed = await getAssetTelemetry(id);
      setSelectedAsset(detailed);
    } catch (err) {
      console.error('Failed to load asset details', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
          <span className="text-muted text-sm font-medium">Loading EV fleet telemetry...</span>
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
          onClick={fetchFleet}
          className="rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 px-5 py-2 text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const anomaliesCount = assets.filter((a) => a.has_thermal_anomaly).length;
  const avgSoh = assets.reduce((acc, a) => acc + a.current_soh, 0) / assets.length;

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
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Total Assets</span>
            <Activity className="h-5 w-5 text-coral" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>{assets.length}</p>
          <p className="mt-1 text-xs text-on-dark-soft">Active heavy-duty electric fleet</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Fleet Avg SoH</span>
            <Battery className="h-5 w-5 text-accent-teal" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>{avgSoh.toFixed(1)}%</p>
          <div className="mt-1 flex items-center text-xs text-on-dark-soft">
            <TrendingDown className="mr-1 h-3 w-3" />
            <span>~0.8% fade per 100 cycles</span>
          </div>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">BMS Anomalies</span>
            <AlertTriangle
              className={`h-5 w-5 ${anomaliesCount > 0 ? 'text-error animate-pulse' : 'text-on-dark-soft'}`}
            />
          </div>
          <p className={`mt-2 text-3xl font-serif font-semibold ${anomaliesCount > 0 ? 'text-error' : 'text-on-dark'}`} style={{ letterSpacing: '-0.5px' }}>
            {anomaliesCount}
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Deviance &gt; 2&sigma; temperature/voltage</p>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 animate-slideUp stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-dark-soft uppercase tracking-wider">Under Maintenance</span>
            <Wrench className="h-5 w-5 text-accent-amber" />
          </div>
          <p className="mt-2 text-3xl font-serif font-semibold text-on-dark" style={{ letterSpacing: '-0.5px' }}>
            {assets.filter((a) => a.status === 'Maintenance').length}
          </p>
          <p className="mt-1 text-xs text-on-dark-soft">Scheduled/predictive servicing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-surface-dark p-5 lg:col-span-1 animate-slideUp stagger-4">
          <h3 className="font-serif text-lg font-semibold text-on-dark mb-4" style={{ letterSpacing: '-0.3px' }}>Active EV Inventory</h3>
          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {assets.map((asset, i) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset.id)}
                  className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all duration-200 animate-slideInRight ${
                    isSelected
                      ? 'border-coral/50 bg-surface-dark-elevated text-on-dark'
                      : 'border-surface-dark-elevated bg-surface-dark-soft/50 text-on-dark-soft hover:border-coral/30 hover:bg-surface-dark-elevated/50'
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-on-dark">{asset.id}</span>
                      <span className="text-xs text-on-dark-soft">&bull; {asset.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        asset.status === 'Active'
                          ? 'bg-success'
                          : asset.status === 'Charging'
                          ? 'bg-accent-teal'
                          : 'bg-accent-amber'
                      }`} />
                      <span className="text-xs text-on-dark-soft">{asset.status}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      <span className={`text-sm font-semibold ${
                        asset.current_soh >= 85
                          ? 'text-success'
                          : asset.current_soh >= 75
                          ? 'text-accent-amber'
                          : 'text-error'
                      }`}>
                        {asset.current_soh.toFixed(0)}%
                      </span>
                      <span className="text-xs text-on-dark-soft">SoH</span>
                    </div>
                    {asset.has_thermal_anomaly && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-semibold text-error">
                        TEMP RISK
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-surface-dark p-6 lg:col-span-2 animate-slideUp stagger-5">
          {selectedAsset ? (
            <div className="space-y-6">
              <div className="flex flex-col justify-between border-b border-surface-dark-elevated pb-4 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-serif text-xl font-semibold text-on-dark" style={{ letterSpacing: '-0.3px' }}>{selectedAsset.id}</h3>
                    <span className="rounded-md bg-surface-dark-elevated px-2.5 py-0.5 text-xs text-on-dark-soft border border-surface-dark-soft">
                      {selectedAsset.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-on-dark-soft">
                    BMS Telemetry &amp; RUL (Remaining Useful Life) Projection
                  </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0">
                  <div className="text-center rounded-lg bg-surface-dark-soft/60 border border-surface-dark-elevated px-4 py-2">
                    <p className="text-[10px] text-on-dark-soft font-semibold uppercase tracking-wider">Health Score</p>
                    <p className={`text-xl font-serif font-semibold ${
                      selectedAsset.health_score >= 80
                        ? 'text-success'
                        : selectedAsset.health_score >= 60
                        ? 'text-accent-amber'
                        : 'text-error'
                    }`}>
                      {selectedAsset.health_score}
                    </p>
                  </div>
                  <div className="text-center rounded-lg bg-surface-dark-soft/60 border border-surface-dark-elevated px-4 py-2">
                    <p className="text-[10px] text-on-dark-soft font-semibold uppercase tracking-wider">RUL (Days)</p>
                    <p className="text-xl font-serif font-semibold text-accent-teal">{selectedAsset.rul_days}</p>
                  </div>
                </div>
              </div>

              {selectedAsset.has_thermal_anomaly && (
                <div className="flex items-start space-x-3 rounded-lg border border-error/20 bg-error/5 p-4 animate-slideUp">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                  <div>
                    <h4 className="font-semibold text-sm text-error">Critical Thermal Anomaly Flagged</h4>
                    <p className="text-xs text-error/80 mt-0.5">
                      Cells showing local deviance &gt; 2&sigma; from fleet average. Operating temperatures
                      exceeding normal profiles. Recommend immediate inspection.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'SoC (Charge)', value: `${selectedAsset.current_soc.toFixed(1)}%`, color: 'text-accent-teal' },
                  { label: 'Cycle Count', value: `${selectedAsset.cycle_count} cycles`, color: 'text-on-dark' },
                  { label: 'Battery Temp', value: `${selectedAsset.temperature_c.toFixed(1)}°C`, color: selectedAsset.temperature_c > 45 ? 'text-error' : 'text-on-dark' },
                  { label: 'BMS Voltage / Current', value: `${selectedAsset.voltage_v.toFixed(0)}V / ${selectedAsset.current_a.toFixed(1)}A`, color: 'text-on-dark' },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-surface-dark-soft/40 p-3.5 border border-surface-dark-elevated/60">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-on-dark-soft">{item.label}</span>
                    <p className={`text-lg font-serif font-semibold mt-0.5 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {telemetryLoading ? (
                <div className="flex h-52 items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-coral border-t-transparent animate-spin" />
                </div>
              ) : selectedAsset.telemetry_history && selectedAsset.telemetry_history.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-on-dark-soft mb-2">
                      SoH Degradation History (Numpy Curve Fit Projection)
                    </h4>
                    <div className="h-56 w-full rounded-lg bg-surface-dark-soft/40 p-3 border border-surface-dark-elevated">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedAsset.telemetry_history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#252320" />
                          <XAxis dataKey="cycle_count" stroke="#6c6a64" fontSize={10} tickLine={false} label={{ value: 'Cycles', position: 'insideBottom', offset: -5, fill: '#6c6a64', fontSize: 10 }} />
                          <YAxis stroke="#6c6a64" fontSize={10} domain={[60, 100]} tickLine={false} label={{ value: 'SoH %', angle: -90, position: 'insideLeft', fill: '#6c6a64', fontSize: 10 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Line type="monotone" dataKey="soh" stroke="#5db872" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-on-dark-soft mb-2">
                        Cell Temperature Trace (&deg;C)
                      </h4>
                      <div className="h-40 w-full rounded-lg bg-surface-dark-soft/40 p-3 border border-surface-dark-elevated">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedAsset.telemetry_history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#252320" />
                            <XAxis dataKey="cycle_count" hide />
                            <YAxis stroke="#6c6a64" fontSize={9} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Line type="monotone" dataKey="temperature" stroke="#c64545" strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-on-dark-soft mb-2">
                        SoC Charge Profile (%)
                      </h4>
                      <div className="h-40 w-full rounded-lg bg-surface-dark-soft/40 p-3 border border-surface-dark-elevated">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedAsset.telemetry_history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#252320" />
                            <XAxis dataKey="cycle_count" hide />
                            <YAxis stroke="#6c6a64" fontSize={9} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Line type="monotone" dataKey="soc" stroke="#5db8a6" strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-on-dark-soft py-10">No telemetry log history available.</p>
              )}

              <div className="flex items-center space-x-3 rounded-lg bg-surface-dark-soft/30 p-4 border border-surface-dark-elevated">
                <Calendar className="h-5 w-5 text-coral" />
                <div className="text-sm">
                  <span className="text-on-dark-soft">Next Scheduled Maintenance: </span>
                  <span className="font-semibold text-on-dark">
                    {selectedAsset.next_maintenance_date || 'None scheduled'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-on-dark-soft">
              Select an EV asset from the inventory to view live telemetry traces and analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
