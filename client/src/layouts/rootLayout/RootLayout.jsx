import { Link, Outlet, useLocation } from "react-router-dom";
import "./rootLayout.css";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/clerk-react";
import { AiOutlineMenu } from "react-icons/ai";
import { useState, useEffect, useMemo, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Keep QueryClient stable across renders — creating it in component body
 * would create a new client on every render which can cause cache resets.
 */
const queryClient = new QueryClient();

const RootLayout = () => {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    // If you add more auth-related routes, consider normalizing or using a prefix check.
    const authPages = new Set(["/register", "/login", "/"]);
    setIsAuthPage(authPages.has(location.pathname));
  }, [location.pathname]);

  // Avoid recreating the static appearance object on every render
  const clerkAppearance = useMemo(
    () => ({
      elements: {
        footerAction: "text-sm text-gray-500",
      },
    }),
    []
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Instead of throwing and crashing the whole app (which can be problematic in SSR or during builds),
  // render a small fallback and log the error. If you want a hard failure during development,
  // you can still throw here behind a NODE_ENV check.
  if (!PUBLISHABLE_KEY) {
    // eslint-disable-next-line no-console
    console.error("Missing Clerk publishable key: VITE_CLERK_PUBLISHABLE_KEY is not set");
    return (
      <div className="rootLayout auth-page">
        <header>
          <Link to={"/"} className="logo">
            <img src="/logo.png" alt="NOEL AI logo" />
            <span>NOEL AI</span>
          </Link>
        </header>
        <main>
          <div style={{ padding: 20 }}>
            <h2>Configuration error</h2>
            <p>The authentication provider is not configured. Please set VITE_CLERK_PUBLISHABLE_KEY.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      autoMedia={true}
      afterSignOutUrl="/"
    >
      <QueryClientProvider client={queryClient}>
        <div className={`rootLayout ${isAuthPage ? "auth-page" : ""}`}>
          <header>
            {!isAuthPage && (
              // Use a real button for accessibility (keyboard + screen reader)
              <button
                type="button"
                className="menu-toggle"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <AiOutlineMenu size={24} />
              </button>
            )}
            <Link to={"/"} className="logo" aria-label="Go to home">
              <img src="/logo.png" alt="NOEL AI logo" />
              <span>NOEL AI</span>
            </Link>
            <div className="user">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <main>
            <ErrorBoundary>
              {/* Wrap Outlet with ErrorBoundary */}
              <Outlet context={{ isMenuOpen, setIsMenuOpen }} />
            </ErrorBoundary>
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
