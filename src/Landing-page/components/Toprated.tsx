import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Worker } from '../types/index';

gsap.registerPlugin(ScrollTrigger);

const TopRated: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const workers: Worker[] = [
    { name: 'electrician', specialty: 'Engine diagnosis and repairs', imgsrc: 'src/assets/electrician.jpg', rating: 4.9 },
    { name: 'Painter', specialty: 'Interior painting professional', imgsrc: 'src/assets/painter.jpg', rating: 4.8 },
    { name: 'Carpainter', specialty: 'Quick leak detection specialist', imgsrc: 'src/assets/carpainter.jpg', rating: 4.9 },
  ];

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        '.toprated-header',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.toprated-header',
            start: 'top 85%',
          },
        }
      );

      // Worker Cards Animation
      // gsap.fromTo(
      //   '.worker-card',
      //   { y: 40, opacity: 0 },
      //   {
      //     y: 0,
      //     opacity: 1,
      //     duration: 0.8,
      //     stagger: 0.15,
      //     ease: 'power3.out',
      //     scrollTrigger: {
      //       trigger: '.workers-grid',
      //       start: 'top 85%',
      //       toggleActions: 'play none none reset',
      //     },
      //   }
      // );

      // Stats Animation
      gsap.fromTo(
        '.stat-card',
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 85%',
          },
        }
      );

      // 🔥 Important: force recalculation
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workers"
      className="py-[120px] px-[5%] bg-cream"
    >
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="toprated-header text-center mb-[60px]">
          <p className="text-sm uppercase tracking-[0.15em] text-primary-green font-semibold mb-3">
            Verified
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-black mb-4">
            Top rated workers
          </h2>
          <p className="text-lg text-gray-600">
            verified professionals with proven track records
          </p>
        </div>

        {/* Workers Grid */}
        <div className="workers-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-[60px]">
          {workers.map((worker) => (
            <div
              key={worker.name}
              className="worker-card bg-white rounded-[20px] overflow-hidden shadow-sm transition-all duration-[400ms] hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative aspect-[4/5] overflow-hidden flex items-center justify-center">
              <img src={worker.imgsrc} alt={worker.name} className="w-full h-full object-cover" />
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
                
                </div>

                <div className="absolute top-4 right-4 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center shadow-md animate-[badge-pulse_2s_ease-in-out_infinite]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <h3 className="font-display text-2xl font-bold text-gray-900">
                  {worker.name}
                </h3>
                <p className="text-[0.95rem] text-gray-600 leading-relaxed">
                  {worker.specialty}
                </p>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {worker.rating}
                  </span>
                </div>

                <button className="mt-2 w-full py-[14px] px-4 bg-transparent text-gray-900 border-2 border-gray-900 rounded-lg font-body text-base font-semibold transition-all duration-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Text */}
        <div className="text-center my-[60px]">
          <p className="text-lg text-gray-600 max-w-[600px] mx-auto leading-relaxed">
            We connect thousands of people with skilled workers across the platform
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-10 mt-[60px]">
          {[
            { value: '50+', label: 'Active workers' },
            { value: '2,400+', label: 'Jobs completed' },
            { value: '15,000+', label: 'Happy customers' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="stat-card bg-white rounded-2xl p-10 text-center shadow-sm transition-all duration-300 border-2 border-transparent hover:border-primary-green hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-primary-green mb-2 tracking-[0.02em]">
                {stat.value}
              </h3>
              <p className="text-base text-gray-600 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </section>
  );
};

export default TopRated;