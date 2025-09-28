import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackToGames({ to, label = 'Back', children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dest = to || location.state?.backTo || '/games';
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const content = children ?? label;
  const isPrimaryBack = (label === 'Back' && !children) || content === 'Back';

  // Compact style (unchanged for All Domains etc.)
  const compactBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 140,
    padding: '12px 18px',
    borderRadius: 12,
    border: '2px solid #f97544',
    background: '#fff',
    color: '#f97544',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(4,37,57,0.08)',
    transition: 'all 160ms ease',
    WebkitTapHighlightColor: 'transparent',
  };
  const compactHover = {
    background: '#f97544',
    color: '#fff',
    boxShadow: '0 12px 28px rgba(249,117,68,0.22)',
    transform: 'translateY(-2px)',
  };

  // Neutral, slightly soft primary button (smaller & calmer than previous)
  const bigBase = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    minWidth: 220,
    maxWidth: 420,
    padding: '16px 30px',
    borderRadius: 24,
    border: '3px solid #f3c9b8',
    background: 'linear-gradient(135deg,#ffffff 0%,#fff8f3 55%,#ffeade 100%)',
    color: '#f9644d',
    fontWeight: 900,
    fontSize: 22,
    letterSpacing: 0.5,
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(4,37,57,0.10), 0 1px 3px rgba(4,37,57,0.15)',
    transition: 'all 160ms ease',
    WebkitTapHighlightColor: 'transparent',
    position: 'relative',
    lineHeight: 1,
  };
  const bigHover = {
    borderColor: '#f7b49d',
    boxShadow: '0 6px 14px rgba(4,37,57,0.12), 0 2px 5px rgba(4,37,57,0.18)',
    transform: 'translateY(-2px)',
  };
  // Pressed-in style: lower shadow & subtle inset outline
  const bigActive = {
    transform: 'translateY(1px) scale(0.985)',
    boxShadow: '0 2px 6px rgba(4,37,57,0.20) inset, 0 1px 2px rgba(4,37,57,0.25)',
    borderColor: '#f39d83',
  };

  const baseStyle = isPrimaryBack ? bigBase : compactBase;
  const hoverStyle = isPrimaryBack ? bigHover : compactHover;

  // Icon (consistent color; no animation)
  const icon = (
    <svg
      width={isPrimaryBack ? 30 : 18}
      height={isPrimaryBack ? 30 : 18}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <path
        d="M19.5 7L10 16l9.5 9"
        stroke="currentColor"
        strokeWidth={isPrimaryBack ? 3.5 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isPrimaryBack && (
        <path
          d="M11 16h13"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.9 }}
        />
      )}
    </svg>
  );

  const textSpanStyle = isPrimaryBack
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(18px, 2.6vw, 26px)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'inherit', // same pre/post hover
        letterSpacing: 0.5,
        padding: '1px 0 0',
      }
    : { lineHeight: 1, flex: '0 1 auto', textAlign: 'center' };

  const mergedStyle = {
    ...baseStyle,
    ...(hover ? hoverStyle : {}),
    ...(active ? (isPrimaryBack ? bigActive : {}) : {}),
  };

  return (
    <button
      onClick={() => navigate(dest)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onBlur={() => setActive(false)}
      aria-label={typeof children === 'undefined' ? (isPrimaryBack ? 'Go Back' : 'Back to games') : undefined}
      style={mergedStyle}
    >
      {icon}
      <span style={textSpanStyle}>{content}</span>
    </button>
  );
}
