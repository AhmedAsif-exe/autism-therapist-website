// src/context/ProjectContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
} from "react";
import { checkAuthStatus } from "axiosInstance";

const ProjectContext = createContext();
const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case "ADD":
      newState = [...state, action.item];
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
export function ContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, dispatch] = useReducer(reducer, [], getInitialCart);
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

  return (
    <ProjectContext.Provider
      value={{ user, loggedIn, loading, cart, dispatch }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
