import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type LocationState = {
  pathname: string;
  search: string;
  state: unknown;
};

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type RouterContextValue = {
  location: LocationState;
  navigate: (to: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);
const basePath =
  import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/'
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : '';

function readLocation(): LocationState {
  const pathname = window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length) || '/'
    : window.location.pathname;
  return { pathname, search: window.location.search, state: window.history.state };
}

export function AdminRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(readLocation());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const target = `${basePath}${to.startsWith('/') ? to : `/${to}`}`;
    if (options.replace) {
      window.history.replaceState(options.state ?? null, '', target);
    } else {
      window.history.pushState(options.state ?? null, '', target);
    }
    setLocation(readLocation());
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('Router hooks must be used inside AdminRouter');
  }
  return context;
}

export function useAdminLocation() {
  return useRouter().location;
}

export function useAdminNavigate() {
  return useRouter().navigate;
}
