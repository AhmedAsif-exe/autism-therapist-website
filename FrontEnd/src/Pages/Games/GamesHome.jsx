import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from 'Utils/PageTemplate';
import style from 'Utils/Card/Card.module.css';
import { useProjectContext } from 'Utils/Context';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Label } from 'recharts';
import { getLastNSessions, getMetrics } from 'Utils/ProgressTracker';

const gamesList = [
	{
		id: 1,
		title: 'Pick the Purpose',
		description: 'Receptive identification of function in an array of 3',
		img: '/Games/icons/hammer.png',
	},
	{
		id: 2,
		title: 'Function Hunt',
		description: 'Identifying all items of a function',
		img: '/Games/icons/screwdriver.png',
	},
	{
		id: 3,
		title: 'Find the Feature',
		description: 'Receptive identification of feature in an array of 3',
		img: '/Games/icons/eye.png',
	},
	{
		id: 4,
		title: 'Feature Quest',
		description: ' Identifying all items given a single feature',
		img: '/Games/icons/paintbrush.png',
	},
	{
		id: 5,
		title: 'Class Match',
		description: 'Receptive identification of class in an array of 3',
		img: '/Games/icons/blocks.png',
	},
	{
		id: 6,
		title: 'Class Catch',
		description: 'Identifying all items given a single class',
		img: '/Games/icons/library.png',
	},
	{
		id: 7,
		title: 'Sort It Out',
		description: 'Sorting items in function, feature and class',
		img: '/Games/icons/box.png',
	},
	{
		id: 8,
		title: 'Category Guess',
		description: 'Pick the correct category',
		img: '/Games/icons/lightbulb.png',
	},
	{
		id: 9,
		title: 'Odd One Out',
		description: 'Find the item that doesn\'t belong',
		img: '/Games/icons/puzzle.png',
	},
	{
		id: 10,
		title: 'Random Rotation',
		description: 'Answering questions in 90 second',
		img: '/Games/icons/stopwatch.png',
	},
];

// Friendly, high-contrast color per game for chips and charts
const gameColors = {
  1: '#FF7A59', // orange
  2: '#4CAF50', // green
  3: '#3F8EFC', // blue
  4: '#9C27B0', // purple
  5: '#FFB300', // amber
  6: '#00B8D9', // teal
  7: '#EC407A', // pink
  8: '#8BC34A', // light green
  9: '#FF7043', // deep orange
  10: '#6D4C41', // brown
};

const lockedLevels = [];
//const lockedLevels = [4,5,6,7,8,9,10];

const GAMES_BUNDLE_ID = 'games-bundle-4-10';
const GAMES_BUNDLE_TITLE = 'Games Bundle (Levels 4-10)';
const GAMES_BUNDLE_PRICE = 4.99;
const GAMES_BUNDLE_BENEFITS = [
	'Unlocks 7 additional games (Levels 4-10)',
	'Access to new games as they are released',
	'One-time purchase, lifetime access',
	'Enhances learning and engagement',
];

// Mini chart component to avoid heavy dependencies
function MiniProgressChart({ history = [], max = 20, color = '#57c785' }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const height = 38;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    // Animate on scroll into view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  const bars = history.map((v, i) => {
    const pct = max ? Math.max(0, Math.min(1, v / max)) : 0;
    return { v, i, pct };
  });

  const gap = 6;
  const barW = bars.length ? Math.max(6, (width - gap * (bars.length - 1)) / bars.length) : 0;

  return (
    <div ref={containerRef} style={{ width: '100%', height, display: 'flex', alignItems: 'flex-end', gap }}>
      {bars.map(({ v, i, pct }) => (
        <div key={i} style={{ flex: `0 0 ${barW}px`, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              height: visible ? `${Math.round(pct * 100)}%` : 0,
              background: color,
              borderRadius: 6,
              boxShadow: '0 2px 6px rgba(4,37,57,0.12)',
              transition: 'height 300ms cubic-bezier(.2,.8,.2,1)',
            }}
            aria-label={`Session ${i + 1}: ${v}/${max}`}
            title={`Session ${i + 1}: ${v}/${max}`}
          />
        </div>
      ))}
      {!bars.length && (
        <div style={{ color: '#8AA3B5', fontSize: 14 }}>No sessions yet</div>
      )}
    </div>
  );
}

export default function GamesHome() {
	const navigate = useNavigate();
	const { cart, dispatch } = useProjectContext();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalLockedGame, setModalLockedGame] = useState(null);

  // View toggle: 'games' or 'progress'
  const [view, setView] = useState('games');
  // Reveal animations when switching views
  const [progressReveal, setProgressReveal] = useState(false);
  const [gamesReveal, setGamesReveal] = useState(true);

  useEffect(() => {
    if (view === 'progress') {
      setProgressReveal(false);
      // delay to allow CSS transition from initial state
      requestAnimationFrame(() => setProgressReveal(true));
      setGamesReveal(false);
    } else {
      setGamesReveal(false);
      requestAnimationFrame(() => setGamesReveal(true));
      setProgressReveal(false);
    }
  }, [view]);

  const [selectedGameId, setSelectedGameId] = useState(1);

  // Pull summaries from localStorage and refresh when we return to page
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const LAST_N = 10;
  const history = useMemo(() => getLastNSessions(selectedGameId, LAST_N), [selectedGameId, refreshKey]);
  const metrics = useMemo(() => getMetrics(selectedGameId, LAST_N), [selectedGameId, refreshKey]);
  const chartData = useMemo(() => history.map((v, i) => ({ name: `S${i + 1}`, value: v, idx: i + 1 })), [history]);
  // Ensure numeric ticks for attempts on X axis
  const xTicks = useMemo(() => chartData.map(d => d.idx), [chartData]);

	const bundleInCart = cart.some(item => item.id === GAMES_BUNDLE_ID);

	const handlePurchaseClick = (game) => {
		setModalLockedGame(game);
		setModalOpen(true);
	};

	const handleAddToCart = () => {
		if (!bundleInCart) {
			dispatch({
				type: 'ADD',
				item: {
					id: GAMES_BUNDLE_ID,
					title: GAMES_BUNDLE_TITLE,
					price: GAMES_BUNDLE_PRICE,
				},
			});
		}
		setModalOpen(false);
	};

  const currentColor = gameColors[selectedGameId] || '#f97544';

	return (
		<PageTemplate
			title="Games"
			subtitle="Choose a game to play!"
			src={require('Assets/Images/banner.png')}
		>
      {/* Toggle pill with animated slider */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{ position: 'relative', background: '#e6edf2', borderRadius: 999, padding: 6, display: 'inline-flex', gap: 6, minWidth: 260 }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: 6,
              width: 'calc(50% - 6px)',
              borderRadius: 999,
              background: '#f97544',
              boxShadow: '0 4px 14px rgba(249,117,68,0.35)',
              transform: view === 'games' ? 'translateX(0%)' : 'translateX(100%)',
              transition: 'transform 360ms cubic-bezier(.2,.8,.2,1)',
            }}
          />
          <button
            onClick={() => setView('games')}
            style={{
              position: 'relative', zIndex: 1,
              flex: 1, border: 'none', cursor: 'pointer', padding: '10px 18px', borderRadius: 999,
              background: 'transparent', color: view === 'games' ? '#fff' : '#265c7e',
              fontWeight: 800, letterSpacing: 0.2, transition: 'color 200ms',
            }}
          >Games</button>
          <button
            onClick={() => setView('progress')}
            style={{
              position: 'relative', zIndex: 1,
              flex: 1, border: 'none', cursor: 'pointer', padding: '10px 18px', borderRadius: 999,
              background: 'transparent', color: view === 'progress' ? '#fff' : '#265c7e',
              fontWeight: 800, letterSpacing: 0.2, transition: 'color 200ms',
            }}
          >Progress</button>
        </div>
      </div>

      {view === 'progress' && (
        <div style={{ width: '100%', background: '#f7f9fb', padding: '24px 16px', borderTop: '1px solid #e6edf2', borderBottom: '1px solid #e6edf2',
          opacity: progressReveal ? 1 : 0, transform: `translateY(${progressReveal ? 0 : 8}px)`, transition: 'opacity 320ms ease, transform 360ms ease' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0, color: '#265c7e', fontWeight: 800, fontSize: 22 }}>Progress Dashboard</h2>
              <div style={{ color: '#8AA3B5', fontSize: 13 }}>Last {LAST_N} sessions</div>
            </div>

            {/* Game selector chips */}
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
                    <span style={{ width: 12, height: 12, borderRadius: 999, background: color, boxShadow: active ? `0 0 0 4px ${color}22` : 'none' }} />
                    <img src={g.img} alt={g.title} style={{ width: 24, height: 24 }} />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{g.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Big line chart area */}
            <div style={{ background: '#fff', border: '1px solid #e6edf2', borderRadius: 16, padding: 16, boxShadow: '0 6px 18px rgba(4,37,57,0.06)',
              opacity: progressReveal ? 1 : 0, transform: `translateY(${progressReveal ? 0 : 8}px)`, transition: 'opacity 360ms ease 60ms, transform 360ms ease 60ms' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: '#042539', fontWeight: 800, fontSize: 18 }}>{gamesList[selectedGameId - 1]?.title || `Game ${selectedGameId}`} Progress</div>
                <div style={{ color: '#8AA3B5', fontSize: 12 }}>Best {metrics.best}/{metrics.maxPossible} • Avg {Math.round(metrics.average * 10) / 10}/{metrics.maxPossible}</div>
              </div>
              {chartData.length ? (
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
                      {/* Updated: black dots for better contrast on white background and faster animation */}
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 10, color: '#265c7e', fontSize: 13 }}>
                <div>Completion: {metrics.completionRate}%</div>
                <div>Sessions: {metrics.count}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'games' && (
			<div
				className="w-full flex flex-wrap justify-center gap-8 py-8"
				style={{ background: '#fff', opacity: gamesReveal ? 1 : 0, transform: `translateY(${gamesReveal ? 0 : 8}px)`, transition: 'opacity 320ms ease, transform 360ms ease' }}
			>
				{gamesList.map((game) => {
					const isLocked = lockedLevels.includes(game.id);
					return (
						<div
							key={game.id}
							className={`${style.card} game-card-custom relative group`}
							onClick={() => !isLocked && navigate(`/games/${game.id}`)}
							style={{
								width: 260,
								height: 340,
								border: isLocked ? '2.5px solid #bbb' : `2.5px solid ${gameColors[game.id] || '#f97544'}`,
								borderRadius: 22,
								boxShadow: isLocked
									? '0 2px 8px rgba(180,180,180,0.08)'
									: '0 6px 24px rgba(4,37,57,0.08), 0 1.5px 6px rgba(4,37,57,0.07)',
								padding: 28,
								background: isLocked
									? 'linear-gradient(135deg, #f7f7f7 60%, #ededed 100%)'
									: 'linear-gradient(135deg, #fff 60%, #f9f6f3 100%)',
								margin: 8,
								opacity: isLocked ? 0.7 : 1,
								pointerEvents: 'auto',
								position: 'relative',
								overflow: 'hidden',
								display: 'grid',
								gridTemplateRows: '170px 1fr',
								alignItems: 'stretch',
								justifyItems: 'center',
								transition: 'transform 200ms ease, box-shadow 200ms ease',
								cursor: isLocked ? 'default' : 'pointer',
                transform: isLocked ? 'none' : 'translateZ(0)',
							}}
							onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(-4px)'; }}
							onMouseLeave={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(0)'; }}
						>
							{/* Lock overlay for locked games */}
							{isLocked && (
								<div style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
									background: 'rgba(255,255,255,0.7)',
									zIndex: 2,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
								}}>
									<img src="/Games/icons/lock.png" alt="Locked" style={{ width: 48, height: 48, marginBottom: 8, opacity: 0.85 }} />
									<span style={{ color: '#888', fontWeight: 600, fontSize: 18 }}>Locked</span>
									<button
										className="mt-4 px-4 py-2 rounded bg-[#f97544] text-white font-semibold hover:bg-[#265c7e] transition-colors"
										style={{ fontSize: 16, marginTop: 16, cursor: 'pointer' }}
										onClick={e => { e.stopPropagation(); handlePurchaseClick(game); }}
									>
										Purchase
									</button>
								</div>
							)}
							<div className={style['icon-title']} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
								<img src={game.img} alt={game.title} style={{ maxHeight: 90, marginBottom: 8, borderRadius: 12, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
								<h3 style={{ color: isLocked ? '#bbb' : (gameColors[game.id] || '#f97544'), fontWeight: 800, fontSize: 22, margin: 0, textAlign: 'center', fontFamily: 'Raleway, sans-serif', letterSpacing: 0.5 }}>{game.title}</h3>
							</div>
							<p className={style['card-body']} style={{ marginTop: 10, color: isLocked ? '#bbb' : '#265c7e', fontSize: 16, textAlign: 'center', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{game.description}</p>
						</div>
					);
				})}
			</div>
      )}
			{/* Purchase Modal */}
			{modalOpen && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						background: 'rgba(0,0,0,0.35)',
						zIndex: 1000,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
					onClick={() => setModalOpen(false)}
				>
					<div
						style={{
							background: '#fff',
							borderRadius: 18,
							boxShadow: '0 8px 32px rgba(4,37,57,0.18)',
							padding: 32,
							minWidth: 320,
							maxWidth: 400,
							position: 'relative',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
              transform: 'scale(1)',
              animation: 'popIn 200ms ease'
						}}
						onClick={e => e.stopPropagation()}
					>
						<img src="/Games/icons/lock.png" alt="Locked" style={{ width: 56, height: 56, marginBottom: 12, opacity: 0.9 }} />
						<h2 style={{ color: '#f97544', fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
							Unlock All Games!
						</h2>
						<ul style={{ color: '#265c7e', fontSize: 16, marginBottom: 16, textAlign: 'left', paddingLeft: 20 }}>
							{GAMES_BUNDLE_BENEFITS.map((b, i) => (
								<li key={i} style={{ marginBottom: 4 }}>{b}</li>
							))}
						</ul>
						<div style={{ fontWeight: 600, fontSize: 20, color: '#265c7e', marginBottom: 18 }}>
							Price: <span style={{ color: '#f97544' }}>${GAMES_BUNDLE_PRICE}</span>
						</div>
						<button
							className="px-6 py-2 rounded bg-[#f97544] text-white font-semibold hover:bg-[#265c7e] transition-colors"
							style={{ fontSize: 18, marginBottom: 8, cursor: bundleInCart ? 'not-allowed' : 'pointer', opacity: bundleInCart ? 0.7 : 1 }}
							onClick={handleAddToCart}
							disabled={bundleInCart}
						>
							{bundleInCart ? 'Already in Cart' : 'Add to Cart'}
						</button>
						<button
							className="mt-2 text[#265c7e] underline hover:text-[#f97544]"
							style={{ fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}
							onClick={() => setModalOpen(false)}
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</PageTemplate>
	);
}