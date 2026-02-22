import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './App.css';

import Navbar from './Landing-page/components/NavBar';
import Hero from './Landing-page/components/Hero';
import Services from './Landing-page/components/Services';
import TopRated from './Landing-page/components/Toprated';
import Feedback from './Landing-page/components/Feedback';
import Questions from './Landing-page/components/Questions';
import SmartServeDashboard, { SmartServeLanding } from './worker/Service';
import { Smart } from './service/Smartservedashboard';
import SmartServeAuth, { type LoginData } from './Landing-page/components/login';

gsap.registerPlugin(ScrollTrigger);

interface UserSession {
  role: "user" | "provider";
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // Smooth scroll behavior
    ScrollTrigger.defaults({
      toggleActions: "play none none reverse"
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleLoginSuccess = (data: LoginData) => {
    // Store login data in state (frontend only, temp)
    setUserSession({
      role: data.role,
      name: data.name,
      email: data.email
    });
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUserSession(null);
    setShowLogin(false);
  };

  // If user is logged in, show appropriate dashboard
  if (userSession) {
    return (
      <div className="App">
        {userSession.role === "user" ?  <SmartServeLanding />: <Smart />}
      </div>
    );
  }

  // If login is shown, display auth component
  if (showLogin) {
    return (
      <div className="App">
        <Navbar onLoginClick={() => setShowLogin(true)} onLogoClick={() => setShowLogin(false)}/>
        <SmartServeAuth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Default: show landing page
  return (
    <div className="App">
      <Navbar onLoginClick={() => setShowLogin(true)} onLogoClick={() => setShowLogin(false)}/>
      <Hero/>
      <Services/>
      <TopRated/>
      <Feedback/>
      <Questions/>
    </div>
  );
}

export default App;

