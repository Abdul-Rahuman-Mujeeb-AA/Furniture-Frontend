import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
  const location = useLocation();

  // Scroll to the top when navigating to another page.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#faf9f6] text-stone-800 antialiased">
      {/* Website navigation */}
      <Navbar />

      {/* Main page content */}
      <main className="relative flex-1">
        <Outlet />
      </main>

      {/* Website footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
