import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { PreloaderContext } from "../../App";
import logo from "../../assets/ecell.png";
import "./PhoneMenu.css";

const PhoneMenu = ({
  isOpen,
  toggleMenu,
  isInstantClose,
  setIsInstantClose,
}) => {
  const location = useLocation();
  const { setLoading } = useContext(PreloaderContext);

  const displayItems = [
    { label: "Home", to: "/" },
    { label: "Events", to: "/events" },
    { label: "Gallery", to: "/gallery" },
    { label: "Team", to: "/team" },
    { label: "Alumni", to: "/alumni" },
    { label: "Word of the Day", to: "/word-of-the-day" },
    { label: "Build Your Idea", to: "/build-your-idea" },
  ];

  const handleLinkClick = (e, item) => {
    if (item.isScroll) {
      e.preventDefault();

      if (location.pathname !== "/") {
        // Navigate to Home first
        setLoading(true);
        setIsInstantClose(true);
        toggleMenu();
        // Simple window navigation to triggers Home page mount logic
        window.location.href = "/#footer";
      } else {
        // Already on home, just scroll
        setIsInstantClose(false);
        toggleMenu();
        const footer = document.getElementById("footer");
        if (footer) {
          footer.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      // Check if routing to a new page
      const isNewPage = location.pathname !== item.to;

      if (isNewPage) {
        setIsInstantClose(true);
        setLoading(true);
        toggleMenu();
      } else {
        // Same page - slow collapse
        setIsInstantClose(false);
        toggleMenu();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred Background Overlay */}
          <motion.div
            className="fixed inset-0 z-[99997] bg-black/10 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleMenu}
          />
          
          {/* Menu Dropdown */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[99998] bg-[#F3F3F3]/50 backdrop-blur-xl flex flex-col pt-6 px-4 md:hidden h-[50vh] overflow-y-auto pb-4 shadow-lg"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{
              duration: isInstantClose ? 0.01 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ fontFamily: "var(--font-body)", willChange: "transform" }}
          >
          {/* Top Bar Spacer (Logo & X button render on top via Navbar.jsx) */}
          <div className="flex items-center justify-center w-full relative h-[46px]">
            <span className="text-[16px] text-[#333] font-light tracking-wide">
              Navigation
            </span>
          </div>

          {/* Divider Line */}
          <div className="w-full h-[1px] bg-black/10 mt-3 mb-4"></div>

          {/* Links */}
          <div className="flex flex-col gap-2 px-2">
            {displayItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.04, ease: "easeOut" }}
                className="flex items-baseline gap-4"
              >
                <span className="text-[10px] text-[#555] font-light w-4">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                {item.isScroll ? (
                  <a
                    href={item.to}
                    className="text-[18px] text-[#1a1a1a] font-light hover:text-black transition-colors"
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="text-[18px] text-[#1a1a1a] font-light hover:text-black transition-colors"
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    {item.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhoneMenu;
