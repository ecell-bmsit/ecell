import React, { useEffect } from 'react';
import IdeaDashboard from '../components/BuildYourIdea/IdeaDashboard';
import Footer from '../components/Footer/Footer';

const BuildYourIdeaPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="build-your-idea-page min-h-screen bg-black text-white relative pt-10">
      <IdeaDashboard />
      <Footer />
    </div>
  );
};

export default BuildYourIdeaPage;
