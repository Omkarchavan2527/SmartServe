import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

interface NavbarProps {
  onLoginClick?: () => void;
  onLogoClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onLogoClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);


    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);

        // Animate the links inside the mobile menu
        if (!isMobileMenuOpen) { // Menu is about to open
            gsap.fromTo('.mobile-menu-container a',
                { x: 100, opacity: 0 }, // Start from right, invisible
                { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out', delay: 0.1 } // Animate to original position, visible, staggered
            );
        } else { // Menu is about to close
            gsap.to('.mobile-menu-container a',
                { x: 100, opacity: 0, stagger: 0.05, duration: 0.2, ease: 'power2.in' } // Animate out to right, invisible, staggered
            );
        }
    };

    return (
        <nav className="bg-[#1a5f4f] px-6 py-4 relative z-20">
            <div className="max-w-1400px mx-auto flex justify-between items-center ">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogoClick}>
                    <div className="transition-transform duration-300  group-hover:scale-105">
                        <img src="src\assets\d6df9d4e-3893-4593-a1ee-a8a42c6c5cf8.png" className='h-16' alt="SmartServe" />
                    </div>
                </div>

                <div className={`mobile-menu-container
          md:flex md:gap-10 md:items-center md:static md:flex-row md:w-auto md:h-auto md:bg-transparent md:p-0 md:shadow-none z-50
          fixed top-24 ${isMobileMenuOpen ? 'right-0 flex flex-col ' : '-right-full'} w-300px h-[38vh]
          bg-white flex-col p-10 gap-8 items-start 
        `}>
                    <a href="#services" className= { `${isMobileMenuOpen ? 'text-black font-semibold' :'text-[0.95rem] font-medium  text-white relative hover:font-bold'}`}>Services</a>
                    <a href="#workers"className= { `${isMobileMenuOpen ? 'text-black font-semibold' :'text-[0.95rem] font-medium  text-white relative hover:font-bold'}`}>Find workers</a>
                    <a href="#about" className= { `${isMobileMenuOpen ? 'text-black font-semibold' :'text-[0.95rem] font-medium  text-white relative hover:font-bold'}`}>About us</a>
                    <a href="#hire" className= { `${isMobileMenuOpen ? 'text-black font-semibold' :'text-[0.95rem] font-medium  text-white relative hover:font-bold'}`}>Hire</a>
                </div>

                <button onClick={onLoginClick} className="hidden md:inline-block px-7 py-3 bg-[#5656d4] hover:bg-[#3232c2] text-white rounded-lg font-body text-base font-semibold transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg">
                    Login
                </button>

                <button
                    className="md:hidden flex flex-col gap-1.25 p-2"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className={`w-6 h-0.75 bg-gray-900 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-6 h-0.75 bg-gray-900 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.75 bg-gray-900 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;