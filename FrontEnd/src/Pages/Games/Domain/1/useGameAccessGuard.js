import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from 'axiosInstance';
import { useProjectContext } from 'Utils/Context';

/**
 * Hook to enforce server-side game access for Domain 1 games.
 * Redirects to /games/domain/1 with a state flag if access denied.
 */
export function useGameAccessGuard(domainIdExpected = 1) {
  const { user, loggedIn, loading } = useProjectContext();
  const { '*': splat } = useParams(); // fallback if using splat route patterns later
  const params = useParams();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Since routes are hardcoded (/games/domain/1/3) instead of parameterized (/games/domain/:domainId/:gameId),
  // we need to parse the URL pathname directly
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/');
  // Expected: ['', 'games', 'domain', '1', '3']
  const domainId = pathParts[3] ? Number(pathParts[3]) : NaN;
  const gameId = pathParts[4] ? Number(pathParts[4]) : NaN;

  useEffect(() => {
    let active = true;
    async function verify() {
      // Wait for auth loading to complete before making decisions
      if (loading) {
        return; // Still loading, don't make any redirects yet
      }
      
      if (!loggedIn) {
        // Auth has loaded and user is not logged in
        navigate('/login');
        return;
      }
      if (domainId !== domainIdExpected || isNaN(gameId)) {
        navigate('/games');
        return;
      }
      try {
        const res = await api.get(`/games/access/${domainId}/${gameId}`);
        if (!active) return;
        if (res.data?.allowed) {
          setAllowed(true);
        } else {
          // User is logged in but doesn't have access to this game
          navigate(`/games/domain/${domainId}`, { replace: true, state: { accessDenied: true } });
        }
      } catch (e) {
        // Network error or other API issue - user is logged in but can't verify access
        navigate(`/games/domain/${domainId}`, { replace: true, state: { accessDenied: true } });
      } finally {
        if (active) setChecking(false);
      }
    }
    verify();
    return () => { active = false; };
  }, [loading, loggedIn, user, gameId, domainId, navigate, domainIdExpected]);

  return { allowed, checking };
}
