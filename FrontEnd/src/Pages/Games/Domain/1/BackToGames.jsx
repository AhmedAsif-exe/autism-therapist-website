import React, { useEffect, useState } from 'react';
import BaseBackToGames from '../../BackToGames';

// Wrapper to reuse the central BackToGames button so styling/props remain consistent
export default function BackToGames(props) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const handler = (e) => setIsNarrow(e.matches);
    // Set initial
    setIsNarrow(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return (
    <div
      style={{
        // When wide: reserve a small column on the left. When narrow: span full width and center the button.
        flex: isNarrow ? '0 0 100%' : '0 0 160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isNarrow ? 'center' : 'flex-start',
        width: isNarrow ? '100%' : 'auto',
      }}
    >
      <BaseBackToGames {...props} />
    </div>
  );
}
