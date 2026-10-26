import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';


import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Events from '../components/Events/Events';
import Footer from '../components/Footer/Footer';
import { IdeaSectionHeader } from '../components/lamp-demo';


const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Check for hash on mount or route change (e.g. #footer or #events)
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          const topPosition = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: topPosition, behavior: 'smooth' });
        }, 500); // Wait for preloader/content transition
      }
    }

    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const element = document.getElementById(targetId);

        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }
    };

    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      anchorLinks.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, [location.hash]);

  return (
    <div className="home-page">
      <Hero />
      <About />
      <Events />
      <section id="build-your-idea"><IdeaSectionHeader /></section>
      <Footer />
    </div>
  );

};

export default Home;