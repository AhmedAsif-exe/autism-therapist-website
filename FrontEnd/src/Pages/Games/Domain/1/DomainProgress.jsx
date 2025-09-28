import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Label } from 'recharts';
import { getLastNSessions, getMetrics } from 'Utils/ProgressTracker';

// Local copy of the games list used in this domain (kept local to avoid coupling)
const gamesList = [
	{ id: 1, title: 'Pick the Purpose' },
	{ id: 2, title: 'Function Hunt' },
	{ id: 3, title: 'Find the Feature' },
	{ id: 4, title: 'Feature Quest' },
	{ id: 5, title: 'Class Match' },
	{ id: 6, title: 'Class Catch' },
	{ id: 7, title: 'Sort It Out' },
	{ id: 8, title: 'Category Guess' },
	{ id: 9, title: "Odd One Out" },
	{ id: 10, title: 'Random Rotation' },
];

const gameColors = {
  1: '#FF7A59',
  2: '#4CAF50',
  3: '#3F8EFC',
  4: '#9C27B0',
  5: '#FFB300',
  6: '#00B8D9',
  7: '#EC407A',
  8: '#8BC34A',
  9: '#FF7043',
  10: '#6D4C41',
};

export default function DomainProgress({ domainId }) {
  const LAST_N = 10;
  const [selectedGameId, setSelectedGameId] = useState(1);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  // Refresh key to update charts when window regains focus
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const onFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Load data when selectedGameId or refreshKey changes
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [historyData, metricsData] = await Promise.all([
          getLastNSessions(selectedGameId, LAST_N),
          getMetrics(selectedGameId, LAST_N)
        ]);
        
        if (mounted) {
          setHistory(historyData);
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
        if (mounted) {
          setHistory([]);
          setMetrics({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      mounted = false;
    };
  }, [selectedGameId, refreshKey]);

  const chartData = useMemo(() => history.map((v, i) => ({ name: `S${i + 1}`, value: v, idx: i + 1 })), [history]);
  const xTicks = useMemo(() => chartData.map(d => d.idx), [chartData]);
  const currentColor = gameColors[selectedGameId] || '#f97544';

  return (
    <div style={{ width: '100%', background: '#f7f9fb', padding: '24px 16px', borderTop: '1px solid #e6edf2', borderBottom: '1px solid #e6edf2' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#265c7e', fontWeight: 800, fontSize: 22, fontFamily: 'Raleway, sans-serif', letterSpacing: 0.5 }}>Progress Dashboard</h2>
          <div style={{ color: '#8AA3B5', fontSize: 13 }}>Last {LAST_N} sessions</div>
        </div>

        <div style={{ display: 'flex', gap: 10, rowGap: 10, flexWrap: 'wrap', paddingBottom: 6, marginBottom: 16, alignItems: 'stretch' }}>
          {gamesList.map((g) => {
            const active = selectedGameId === g.id;
            const color = gameColors[g.id] || '#265c7e';
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGameId(g.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  borderRadius: 999, border: `2px solid ${active ? color : '#e6edf2'}`, background: '#fff',
                  color: active ? color : '#042539', cursor: 'pointer', boxShadow: active ? '0 6px 16px rgba(0,0,0,0.08)' : '0 2px 8px rgba(4,37,57,0.06)',
                  transform: active ? 'scale(1.04)' : 'scale(1.0)', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, color 180ms ease',
                  minWidth: 220, flex: '0 1 auto', flexShrink: 0, whiteSpace: 'nowrap'
                }}
                aria-pressed={active}
              >
                <span style={{ width: 12, height: 12, borderRadius: 999, background: color, boxShadow: active ? `${color}22 0 0 0 4px` : 'none' }} />
                <img src={`/Games/icons/${g.id === 1 ? 'hammer' : g.id === 2 ? 'screwdriver' : g.id === 3 ? 'eye' : g.id === 4 ? 'paintbrush' : g.id === 5 ? 'blocks' : g.id === 6 ? 'library' : g.id === 7 ? 'box' : g.id === 8 ? 'lightbulb' : g.id === 9 ? 'puzzle' : 'stopwatch'}.png`} alt={g.title} style={{ width: 24, height: 24 }} />
                <span style={{ fontWeight: 800, fontSize: 15 }}>{g.title}</span>
              </button>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e6edf2', borderRadius: 16, padding: 16, boxShadow: '0 6px 18px rgba(4,37,57,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ color: '#042539', fontWeight: 800, fontSize: 18 }}>{gamesList[selectedGameId - 1]?.title || `Game ${selectedGameId}`} Progress</div>
            {!loading && <div style={{ color: '#8AA3B5', fontSize: 12 }}>Best {metrics.best}/{metrics.maxPossible} • Avg {Math.round(metrics.average * 10) / 10}/{metrics.maxPossible}</div>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 340, color: '#8AA3B5', fontSize: 16 }}>
              Loading progress data...
            </div>
          ) : chartData.length ? (
            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 28, left: 84 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
                  <XAxis
                    dataKey="idx"
                    type="number"
                    domain={[1, chartData.length || 1]}
                    ticks={xTicks}
                    allowDecimals={false}
                    tick={{ fill: '#042539', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e6edf2' }}
                    tickLine={{ stroke: '#e6edf2' }}
                    tickMargin={6}
                    label={{ value: 'Number of attempts', position: 'insideBottom', offset: -10, fill: '#265c7e', fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    domain={[0, metrics.maxPossible]}
                    allowDecimals={false}
                    tick={{ fill: '#042539', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e6edf2' }}
                    tickLine={{ stroke: '#e6edf2' }}
                    tickMargin={6}
                  >
                    <Label value="Frequency of correct attempts" angle={-90} position="outsideLeft" offset={22} style={{ fill: '#265c7e', fontSize: 12, fontWeight: 700 }} />
                  </YAxis>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e6edf2', borderRadius: 12, boxShadow: '0 6px 18px rgba(4,37,57,0.08)' }}
                    labelStyle={{ color: '#265c7e', fontWeight: 800 }}
                    formatter={(v, _name, payload) => {
                      const idx = payload?.payload?.idx;
                      return [`${v} correct`, `Attempt ${idx}`];
                    }}
                  />
                  <Line type="linear" dataKey="value" stroke={currentColor} strokeWidth={4}
                    strokeLinecap="square" strokeLinejoin="miter"
                    dot={{ r: 4, stroke: '#000', strokeWidth: 2, fill: '#000' }}
                    activeDot={{ r: 7, stroke: '#000', fill: '#000' }}
                    isAnimationActive animationDuration={400} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: '#8AA3B5', fontSize: 14, padding: '24px 8px' }}>No sessions yet for this game.</div>
          )}

          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 10, color: '#265c7e', fontSize: 13 }}>
              <div>Completion: {metrics.completionRate}%</div>
              <div>Sessions: {metrics.count}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
