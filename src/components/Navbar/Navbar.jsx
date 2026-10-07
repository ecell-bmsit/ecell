import React, { useState, useEffect, useContext } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/ecell1.png";
import { PreloaderContext } from "../../App";
import PhoneMenu from "./PhoneMenu";
import "./PhoneMenu.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstantClose, setIsInstantClose] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { loading } = useContext(PreloaderContext);

  // Prevent scrolling when full screen mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("phone-menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("phone-menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("phone-menu-open");
    };
  }, [isOpen]);

  // Hide navbar on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const toggleMenu = () => {
    if (!isOpen) {
      setIsInstantClose(false); // Reset to slow animation when opening
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        // If preloader is still running, hide navbar
        if (loading) {
          setIsVisible(false);
        }
        // After preloader: show at top or when scrolling up
        else if (currentScrollY < 100 || currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
        // Hide navbar when scrolling down (after 100px)
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
          setIsOpen(false); // Close mobile menu when hiding
        }

        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      // Run once on mount to set initial state
      controlNavbar();
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [lastScrollY, loading]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/gallery", label: "Gallery" },
    { to: "/team", label: "Team" },
    { to: "/alumni", label: "Alumni" },
    { to: "/word-of-the-day", label: "Word of the Day" },
    { to: "/build-your-idea", label: "Build Your Idea" },
  ];

  return (
    <>
      <nav
        className={`fixed z-[99999] transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        } md:top-6 md:left-1/2 md:-translate-x-1/2 top-6 right-4`}
        style={{
          fontFamily: "var(--font-heading)",
        }}
      >
        {/* Desktop & Mobile Container */}
        <div className="relative">
          {/* Main Navbar */}
          <div className="md:bg-black/40 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-full px-4 py-2.5 flex items-center gap-2 w-fit mx-auto bg-transparent border-none">
            {/* Logo - Desktop Only */}
            <Link to="/" className="hidden md:flex flex-shrink-0 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 p-1.5 ">
                <img
                  src={logo}
                  alt="E-CELL Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    location.pathname === item.to
                      ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden hamburger-toggle ${isOpen ? "active" : ""}`}
              aria-label="Toggle menu"
              style={{
                color: isOpen ? "#1a1a1a" : "white",
              }}
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full Screen Menu */}
      <PhoneMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        isInstantClose={isInstantClose}
        setIsInstantClose={setIsInstantClose}
      />
    </>
  );
}
