import { Link, Outlet, useLocation } from "react-router-dom";
import "./rootLayout.css";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/clerk-react";
import { AiOutlineMenu } from "react-icons/ai";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary";

const RootLayout = () => {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isAuthPage, setIsAuthPage] = useState(false);
  const queryClient = new QueryClient();

  useEffect(() => {
    const authPages = ["/register", "/login", "/"];
    setIsAuthPage(authPages.includes(location.pathname));
  }, [location.pathname]);

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          footerAction: "text-sm text-gray-500",
        },
      }}
      autoMedia={true}
      afterSignOutUrl="/"
    >
      <QueryClientProvider client={queryClient}>
        <div className={`rootLayout ${isAuthPage ? "auth-page" : ""}`}>
          <header>
            {!isAuthPage && (
              <div className="menu-toggle" onClick={toggleMenu}>
                <AiOutlineMenu size={24} />
              </div>
            )}
            <Link to={"/"} className="logo">
              <img src="/logo.png" alt="" />
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
              {" "}
              {/* Wrap Outlet with ErrorBoundary */}
              <Outlet context={[isMenuOpen, setIsMenuOpen]} />
            </ErrorBoundary>
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
