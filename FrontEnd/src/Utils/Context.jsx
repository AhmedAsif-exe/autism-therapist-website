// src/context/ProjectContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
} from "react";
import api, { checkAuthStatus } from "axiosInstance";

const ProjectContext = createContext();
const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case "ADD":
      if (state.some((i) => i.id === action.item.id)) {
        newState = state; // no change
      } else {
        newState = [...state, action.item];
      }
      break;
    case "REMOVE":
      newState = state.filter((i) => i.id !== action.id);
      break;
    case "CLEAR":
      newState = [];
      break;
    default:
      return state;
  }

  localStorage.setItem("cart", JSON.stringify(newState));
  return newState;
};
const getInitialCart = () => {
  const localData = localStorage.getItem("cart");
  return localData ? JSON.parse(localData) : [];
};

const SYMBOLS = { EUR: "€", USD: "$", PKR: "Rs " };

/** Convert EUR → display amount, rounded to 1 decimal. */
export function convertPrice(eur, rate = 1) {
  return Math.round((Number(eur) || 0) * (Number(rate) || 1) * 10) / 10;
}

/** Format Sanity/cart EUR amount into display currency (1 decimal). */
export function formatPrice(eur, currency = "EUR", rate = 1) {
  const symbol = SYMBOLS[currency] || `${currency} `;
  return `${symbol}${convertPrice(eur, rate).toFixed(1)}`;
}

/** Format an already-converted display amount. */
export function formatAmount(amount, currency = "EUR") {
  const symbol = SYMBOLS[currency] || `${currency} `;
  return `${symbol}${(Math.round((Number(amount) || 0) * 10) / 10).toFixed(1)}`;
}

export function ContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, dispatch] = useReducer(reducer, [], getInitialCart);
  const [currency, setCurrency] = useState("EUR");
  const [rate, setRate] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let isMounted = true; // ✅ prevent state update on unmounted component

    checkAuthStatus()
      .then((res) => {
        if (isMounted) {
          setUser(res);
          setLoggedIn(!!res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoggedIn(false);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      let countryHint = "";
      try {
        // Browser's public IP country (not the VPS) — fixes PK users hitting NL-hosted API
        const geo = await fetch("https://api.country.is/");
        if (geo.ok) {
          const data = await geo.json();
          countryHint = data.country || "";
        }
      } catch (_) {
        /* ignore — backend may still resolve from request IP */
      }
      try {
        const res = await api.get("/paypal/currency", {
          params: countryHint ? { country: countryHint } : undefined,
        });
        if (!isMounted) return;
        setCurrency(res.data?.currency || "EUR");
        setRate(Number(res.data?.rate) > 0 ? Number(res.data.rate) : 1);
      } catch {
        if (!isMounted) return;
        setCurrency("EUR");
        setRate(1);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUser = async () => {
    const res = await checkAuthStatus();
    setUser(res);
    setLoggedIn(!!res);
    return res;
  };

  return (
    <ProjectContext.Provider
      value={{
        user,
        loggedIn,
        loading,
        cart,
        dispatch,
        currency,
        rate,
        refreshUser,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
