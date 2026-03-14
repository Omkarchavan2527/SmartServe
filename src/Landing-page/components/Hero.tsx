import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import videoSrc from '../../assets/VID-20260223-WA0001.mp4';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null); // This ref is for the entire section, used by GSAP context.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        delay: 0.3
      }) // Target the class for both subtitle elements
        .from('.hero-subtitle-text', {
          y: 50,
          opacity: 0,
          duration: 1
        }, '-=0.6')
        .from('.search-box', {
          y: 30,
          opacity: 0,
          duration: 0.8
        }, '-=0.4')
        .from(imageRef.current, {
          y: -100, // Animate from top to bottom
          opacity: 0,
          duration: 1.2
        }, '-=1')
        .from('.hero-stat', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1
        }, '-=0.5');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (

    <section
      ref={heroRef}
      className="relative  min-h-screen flex items-center  overflow-hidden bg-linear-to-br from-[#1a5f4f] to-[#0d3d31]"
  >
      <video src={videoSrc} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover  z-0"></video>

      <div className="relative z-10 max-w-1400px mx-auto px-[5%] py-8 md:py-16">
        <div className="text-white text-left">
          <h1
            ref={titleRef}
            className="font-bold pb-4 md:pb-6 text-[clamp(2.5rem,8vw,5.5rem)] tracking-[0.09em] uppercase leading-[0.95] mb-4 md:mb-6"
          >
            Find the right service worker today
          </h1>

          {/* Mobile-first approach: subtitle always visible */}
          <p
            className="hero-subtitle-text text-base md:text-lg leading-relaxed mb-6 md:mb-10 opacity-95 max-w-135 mx-auto"
          >
            Connect with trusted electricians, plumbers, carpenters and more to your dispatch centers and servers efficiently when you need them!
          </p>


          {/* Desktop layout with grid */}
          {/* <div className='hidden md:grid md:grid-cols-2 gap-8 md:gap-20 items-center'>
            <div className="order-2 md:order-1">
              {/* Subtitle for desktop (already above) */}
          {/* </div>
            <div ref={imageRef} className="relative flex justify-center items-center order-1 md:order-2">
              <img src="src\assets\ChatGPT Image Jan 31, 2026, 10_46_09 AM.png.jpg" className='h-50 w-auto max-w-full rounded-lg shadow-amber-50' alt="" />
            </div>
          </div> */}

          {/* <div className="search-box bg-white rounded-xl p-2 shadow-lg max-w-[600px]">
            <div className="flex gap-2 items-center flex-col md:flex-row">
              <input 
                type="text" 
                placeholder="Search" 
                className="flex-1 px-5 py-4 rounded-lg text-base font-body bg-gray-100 outline-none transition-colors focus:bg-gray-200 w-full"
              />
              <select className="px-5 py-4 rounded-lg text-base font-body bg-gray-500 cursor-pointer outline-none min-w-[140px] w-full md:w-auto">
                <option>Service</option>
                <option>Electrician</option>
                <option>Plumber</option>
                <option>Carpenter</option>
                <option>Painter</option>
              </select>
              <button className="px-9 py-4 bg-primary-green text-white rounded-lg font-body text-base font-semibold transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap w-full md:w-auto">
                Search
              </button>
            </div>
          </div> */}
        </div>

      </div>

      {/* If you need scoped styles, use a CSS module or global style. Remove 'jsx' prop. */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </section>
  );
};

export default Hero;