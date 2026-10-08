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
        } md:top-6 md:left-1/2 md:-translate-x-1/2 top-6 left-0 right-0 px-4 md:px-0`}
        style={{
          fontFamily: "var(--font-heading)",
        }}
      >
        {/* Desktop & Mobile Container */}
        <div className="relative w-full">
          {/* Main Navbar */}
          <div className="flex items-center justify-end md:justify-center gap-3 w-full md:w-fit mx-auto">
            {/* Logo Button */}
            <Link 
              to="/" 
              className="hidden md:flex items-center justify-center w-[46px] h-[46px] rounded-full bg-[#E8E8E8] hover:bg-[#DCDCDC] transition-all duration-300"
            >
              <img
                src={logo}
                alt="E-CELL Logo"
                className="w-6 h-6 object-contain brightness-0"
              />
            </Link>

            {/* Desktop Menu Pill */}
            <div className="hidden md:flex items-center bg-[#E8E8E8] rounded-full px-1.5 py-1.5 gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-5 py-1.5 rounded-full text-[14px] tracking-wide transition-all duration-300 whitespace-nowrap ${
                    location.pathname === item.to
                      ? "bg-[#D4D4D4] text-black font-semibold shadow-sm"
                      : "text-[#555555] hover:text-black font-medium hover:bg-[#DCDCDC]/50"
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden hamburger-toggle flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-[#E8E8E8] hover:bg-[#DCDCDC] transition-all duration-300 ${isOpen ? "active" : ""}`}
              style={{ backgroundColor: isOpen ? 'transparent' : '#E8E8E8' }}
              aria-label="Toggle menu"
            >
              <div className="hamburger-line" style={{ backgroundColor: "#1a1a1a" }}></div>
              <div className="hamburger-line" style={{ backgroundColor: "#1a1a1a" }}></div>
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
