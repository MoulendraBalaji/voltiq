import type { EVAsset, ICEVehicle, SupplyChainGraph, CarbonMetrics } from '../types';

const API_BASE = 'http://localhost:8000';

export async function getFleetHealth(): Promise<EVAsset[]> {
  const res = await fetch(`${API_BASE}/api/fleet/health`);
  if (!res.ok) throw new Error('Failed to fetch fleet health');
  return res.json();
}

export async function getAssetTelemetry(assetId: string): Promise<EVAsset> {
  const res = await fetch(`${API_BASE}/api/fleet/telemetry/${assetId}`);
  if (!res.ok) throw new Error(`Failed to fetch telemetry for ${assetId}`);
  return res.json();
}

export async function getElectrificationPlan(): Promise<ICEVehicle[]> {
  const res = await fetch(`${API_BASE}/api/fleet/planner`);
  if (!res.ok) throw new Error('Failed to fetch electrification plan');
  return res.json();
}

export async function getSupplyChainGraph(): Promise<SupplyChainGraph> {
  const res = await fetch(`${API_BASE}/api/supply-chain`);
  if (!res.ok) throw new Error('Failed to fetch supply chain graph');
  return res.json();
}

export async function getCarbonIntelligence(): Promise<CarbonMetrics> {
  const res = await fetch(`${API_BASE}/api/carbon`);
  if (!res.ok) throw new Error('Failed to fetch carbon metrics');
  return res.json();
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function askCopilot(
  query: string,
  sessionId: string,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/copilot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, session_id: sessionId }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        callbacks.onError('Rate limit exceeded (10 requests/minute). Please slow down.');
      } else {
        callbacks.onError('Failed to connect to VoltIQ Copilot.');
      }
      callbacks.onDone();
      return;
    }

    if (!res.body) {
      callbacks.onError('No response body received from Copilot.');
      callbacks.onDone();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete last line

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith('data:')) continue;

        try {
          const dataStr = cleanLine.substring(5).trim();
          const parsed = JSON.parse(dataStr);

          if (parsed.type === 'text') {
            callbacks.onChunk(parsed.content);
          } else if (parsed.type === 'error') {
            callbacks.onError(parsed.content);
          }
        } catch (e) {
          console.error('Failed to parse SSE line:', cleanLine, e);
        }
      }
    }
  } catch (error: any) {
    callbacks.onError(error.message || 'Network error occurred.');
  } finally {
    callbacks.onDone();
  }
}
