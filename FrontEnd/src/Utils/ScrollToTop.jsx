import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "./LenisProvider";

/**
 * React Router keeps the window scroll offset across navigations, so a new page
 * opens wherever the previous one was scrolled to. Reset it on every route change.
 *
 * Lenis drives scrolling from its own RAF loop and rewrites the position each
 * frame, which silently undoes a plain window.scrollTo — so ask Lenis to jump
 * instead, and only fall back to the native call before it has mounted.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}
