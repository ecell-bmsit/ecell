import {
  useState,
  useEffect,
  createContext,
  useRef,
  Suspense,
  lazy,
  Component
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar/Navbar";
import Preloader from "./components/Preloader/Preloader";
import { WordProvider } from "./context/WordContext";
import "./App.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Runtime error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "red", background: "white", minHeight: "100vh" }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: "0.8rem", marginTop: "1rem" }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import Home from "./Pages/Home";
const Alumni = lazy(() => import("./Pages/Alumni"));
const Gallery = lazy(() => import("./Pages/Gallery"));
const EventPage = lazy(() => import("./Pages/EventPage"));
const Codered = lazy(() => import("./components/Events/Codered"));
const Advert = lazy(() => import("./components/Events/Advert1"));
const Spl = lazy(() => import("./components/Events/Spl"));
const EmpireX = lazy(() => import("./components/Events/EmpireX"));
const Spl2 = lazy(() => import("./components/Events/Spl2"));
const CaseCrackers = lazy(() => import("./components/Events/CaseCrackers"));
const Chitting = lazy(() => import("./components/Events/Chitting"));
const PanelDiscussion = lazy(
  () => import("./components/Events/PanelDisscussion"),
);
const Ripoff = lazy(() => import("./components/Events/Ripoff"));
const Team = lazy(() => import("./Pages/Team"));
const Mentors = lazy(() => import("./Pages/Mentors"));
const WordOfTheDay = lazy(() => import("./Pages/WordOfTheDay.jsx"));
const WordDetailPage = lazy(() => import("./Pages/WordDetailPage.jsx"));
const WordAdmin = lazy(() => import("./Pages/WordAdmin.jsx"));
const HigherLowerGame = lazy(() => import("./Pages/HigherLowerGame.jsx"));
const HigherLowerAdmin = lazy(() => import("./Pages/HigherLowerAdmin.jsx"));
const HigherLowerLeaderboard = lazy(
  () => import("./Pages/HigherLowerLeaderboard.jsx"),
);
const HitCounterPage = lazy(() => import("./Pages/HitCounterPage.jsx"));
const Recap2025 = lazy(() => import("./Pages/Recap2025.jsx"));
const BuildYourIdeaPage = lazy(() => import("./Pages/BuildYourIdeaPage.jsx"));
const CrosswordGame = lazy(() => import("./Pages/CrosswordGame.jsx"));
const CrosswordAdmin = lazy(() => import("./Pages/CrosswordAdmin.jsx"));
const CrosswordLeaderboard = lazy(() => import("./Pages/CrosswordLeaderboard.jsx"));
const DummyLeaderboard = lazy(() => import("./Pages/DummyLeaderboard.jsx"));
const AdvertTimer = lazy(() => import("./Pages/AdvertTimer.jsx"));
const AdvertTimerV2 = lazy(() => import("./Pages/AdvertTimerV2.jsx"));
const AdvertLead = lazy(() => import("./Pages/AdvertLead.jsx"));
const NotFound = lazy(() => import("./Pages/NotFound.jsx"));

export const PreloaderContext = createContext();

// NavigationWatcher: Component that listens for route changes
const NavigationWatcher = ({ setLoading, setShowContent, setDisplayLocation }) => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    // Only trigger if path actually changed and it's not the initial mount
    if (prevPath.current !== location.pathname) {
      setDisplayLocation(location); // Immediately sync route so correct page renders
      setLoading(true);
      setShowContent(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevPath.current = location.pathname;
    }
  }, [location, setLoading, setShowContent, setDisplayLocation]);

  return null;
};

function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const hasSeenPreloader = sessionStorage.getItem("preloaderShown");
  const [loading, setLoading] = useState(!hasSeenPreloader);
  const [showContent, setShowContent] = useState(!!hasSeenPreloader);
  const [themePreference, setThemePreference] = useState(() => localStorage.getItem("ecell-theme-preference"));

  const isSpl3 = location.pathname === "/events/spl3" || location.pathname === "/spl3";
  const darkByDefaultRoutes = ["/gallery", "/team", "/recap", "/alumni"];
  const isLightMode = themePreference
    ? themePreference === "light"
    : !darkByDefaultRoutes.includes(location.pathname);

  const handleThemeToggle = (event) => {
    const isKeyboardTrigger = event?.clientX === 0 && event?.clientY === 0;
    const fallbackX = window.innerWidth - 28;
    const fallbackY = window.innerHeight - 28;
    const clickX = isKeyboardTrigger ? fallbackX : event.clientX;
    const clickY = isKeyboardTrigger ? fallbackY : event.clientY;

    document.documentElement.style.setProperty('--theme-toggle-x', `${clickX}px`);
    document.documentElement.style.setProperty('--theme-toggle-y', `${clickY}px`);

    const nextTheme = isLightMode ? "dark" : "light";
    const applyTheme = () => {
      localStorage.setItem("ecell-theme-preference", nextTheme);
      setThemePreference(nextTheme);
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    document.startViewTransition(() => {
      applyTheme();
    });
  };

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("preloaderShown", "true");
    setDisplayLocation(location); // Sync the displayed route ONLY after preloader is done
    setLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  const shouldShowNavbar = location.pathname !== "/event-higher-lower" && location.pathname !== "/recap" && location.pathname !== "/advert/game/crossword" && location.pathname !== "/advert/game/leaderboard" && location.pathname !== "/advert/game/leaderboard2" && location.pathname !== "/event/timer" && location.pathname !== "/event/timer2" && location.pathname !== "/advert/lead";

  useEffect(() => {
    // Increment hit counter once per session
    const hasBeenCounted = sessionStorage.getItem("visitCounted");
    if (!hasBeenCounted) {
      fetch("/api/hits/increment", { method: "POST" })
        .then((res) => {
          if (!res.ok) throw new Error("Backend offline");
          return res.json();
        })
        .then((data) => {
          if (data && data.success) {
            sessionStorage.setItem("visitCounted", "true");
          }
        })
        .catch(() => console.warn("Hit counter not available (backend offline)"));
    }
  }, []);

  return (
    <ErrorBoundary>
      <PreloaderContext.Provider value={{ loading, setLoading }}>
        <WordProvider>
        {/* We move Router to wrap everything including useLocation usage */}
        <NavigationWatcher
          setLoading={setLoading}
          setShowContent={setShowContent}
          setDisplayLocation={setDisplayLocation}
        />
        {shouldShowNavbar && <Navbar />}
        <div className="relative pt-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <Preloader key="preloader" onComplete={handlePreloaderComplete} />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`min-h-screen ${isLightMode && !isSpl3 ? 'light-theme' : ''}`}
              >
                <Suspense fallback={<div className="min-h-screen"></div>}>
                  <Routes location={displayLocation}>
                    <Route path="/" element={<Home />} />
                    <Route path="/word-of-the-day" element={<WordOfTheDay />} />
                    <Route
                      path="/word-of-the-day/:id"
                      element={<WordDetailPage />}
                    />
                    <Route
                      path="/admin/word-of-the-day"
                      element={<WordAdmin />}
                    />
                    <Route
                      path="/admin/higher-lower"
                      element={<HigherLowerAdmin />}
                    />
                    <Route path="/events" element={<EventPage />} />
                    <Route path="/events/codered25" element={<Codered />} />
                    <Route path="/events/advert20" element={<Advert />} />
                    <Route path="/events/spl" element={<Spl />} />
                    <Route path="/events/empirex" element={<EmpireX />} />
                    <Route path="/events/spl3" element={<Spl2 />} />
                    <Route path="/spl3" element={<Spl2 />} />
                    <Route
                      path="/events/casecrackers"
                      element={<CaseCrackers />}
                    />
                    <Route path="/events/chitting" element={<Chitting />} />
                    <Route
                      path="/events/paneldiscussion"
                      element={<PanelDiscussion />}
                    />
                    <Route path="/events/ripoff" element={<Ripoff />} />
                    <Route path="/alumni" element={<Alumni />} />
                    <Route path="/mentors" element={<Mentors />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route
                      path="/event-higher-lower"
                      element={<HigherLowerGame />}
                    />
                    <Route
                      path="/event-higher-lower/leaderboard"
                      element={<HigherLowerLeaderboard />}
                    />
                    <Route path="/hit/counter" element={<HitCounterPage />} />
                    <Route path="/recap" element={<Recap2025 />} />
                    <Route path="/build-your-idea" element={<BuildYourIdeaPage />} />
                    <Route path="/advert/game/crossword" element={<CrosswordGame />} />
                    <Route path="/advert/game/leaderboard" element={<CrosswordLeaderboard />} />
                    <Route path="/advert/game/leaderboard2" element={<DummyLeaderboard />} />
                    <Route path="/advert/admin" element={<CrosswordAdmin />} />
                    <Route path="/event/timer" element={<AdvertTimer />} />
                    <Route path="/event/timer2" element={<AdvertTimerV2 />} />
                    <Route path="/advert/lead" element={<AdvertLead />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
          {!loading && !isSpl3 && location.pathname !== "/recap" && location.pathname !== "/alumni" && (
            <button
              type="button"
              role="switch"
              aria-checked={isLightMode}
              aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={handleThemeToggle}
              className={`theme-toggle preserve-color ${isLightMode ? 'theme-toggle--light' : 'theme-toggle--dark'}`}
            >
              {isLightMode ? <Moon size={22} /> : <Sun size={22} />}
            </button>
          )}
        </div>
        </WordProvider>
      </PreloaderContext.Provider>
    </ErrorBoundary>
  );
}

// We need to move Router out of App to use useLocation inside App
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
