import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Service } from '../types/index';

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const services: Service[] = [
    {
      title: 'ELECTRICIAN',
      description: 'We cut off you fighting from in the blarnon criminals foster helper provides the powered by businesses by a discoverable locate and',
      color: '#e63946',
      image: 'src/assets/lucid-origin_Ultra-realistic_professional_electrician_in_a_dynamic_working_pose_wearing_moder-0.jpg'
    },
    {
      title: 'PLUMBER',
      description: 'Professional plumbing services for all your home and commercial needs. Expert leak detection and pipe repair.',
      color: '#2a7f6a',
      image: 'src/assets/lucid-origin_Ultra-realistic_professional_electrician_in_a_dynamic_working_pose_wearing_moder-0.jpg' // Placeholder image
    },
    {
      title: 'PAINTER',
      description: 'Expert painting and finishing services for interiors and exteriors. Professional quality guaranteed.',
      color: '#f77f00',
      image: 'src/assets/lucid-origin_Ultra-realistic_professional_house_painter_in_a_dynamic_working_pose_wearing_mod-0 (1).jpg'
    },
    {
      title: 'CARPENTER',
      description: 'Custom woodwork and carpentry services. Quality craftsmanship for your home and office.',
      color: '#6366f1',
      image: 'src/assets/lucid-origin_Ultra-realistic_professional_carpenter_in_a_dynamic_working_pose_wearing_modern_-0.jpg'
    },
    {
      title: 'MECHANIC',
      description: 'Auto repair and maintenance services. Expert diagnostics and reliable fixes for all vehicles.',
      color: '#ec4899',
      image: 'src/assets/lucid-origin_Ultra-realistic_professional_electrician_in_a_dynamic_working_pose_wearing_moder-0.jpg' // Placeholder image
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.services-header', {
        scrollTrigger: {
          trigger: '.services-header',
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate content when service changes
  useEffect(() => {
    if (textRef.current && imageRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      // Animate out
      tl.to(textRef.current.children, { // Animate out text elements
        opacity: 0,
        y: -20, // Move text up when animating out
        duration: 0.2,
        ease: 'power2.in',
        stagger: 0.05
      }, 0) // Start at the same time as image out
      .from(imageRef.current, { // Animate out image
        opacity: 0,
        y: -400, // Move image down when animating out
        duration: 0.3,
        ease: 'power2.in'
      }, 0.5) // Start at the same time as text out
      // Set initial positions for new content (invisible)
      .set(textRef.current.children, {
        y: 50, // Text starts from bottom
        opacity: 0
      })
      .set(imageRef.current, {
        y: -100, // Image starts from top
        opacity: 0
      })
      // Animate in new content
      .to(textRef.current.children, { // Animate in text elements
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05
      }, ">-0.2") // Start text animation slightly before image
      .to(imageRef.current, { // Animate in image
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "<"); // Start image animation at the same time as text
    }
  }, [currentIndex]);

  const nextService = (): void => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevService = (): void => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const currentService = services[currentIndex];

  return (
    <section ref={sectionRef} id="services" className="py-[120px] px-[5%] bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="services-header text-center mb-[60px]">
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-black mb-4 text-gray-900">
            Services we offer
          </h2>
          <p className="text-lg text-gray-600">Browse our professional services</p>
        </div>

        {/* Service Card Container - Stays in place */}
        <div className="relative max-w-[1200px] mx-auto">
          <div 
            ref={contentRef}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gray-100 relative"
          >
            <div className="grid md:grid-cols-2 items-center p-[60px] gap-10 relative z-[2]">
              
              {/* Text Content - Animates */}
              <div ref={textRef} className="flex flex-col gap-5">
                <h3 
                  className="font-heading text-[clamp(2.5rem,5vw,4rem)] tracking-[0.02em] uppercase leading-none mb-2 transition-colors duration-300"
                  style={{ color: currentService.color }}
                >
                  {currentService.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-700 max-w-[450px]">
                  {currentService.description}
                </p>
                <button 
                  className="flex items-center gap-2 text-gray-900 font-body text-base font-semibold mt-3 transition-all duration-300 hover:gap-3 w-fit group"
                  style={{ color: currentService.color }}
                >
                  Learn More
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={prevService}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Previous service"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 group-hover:-translate-x-0.5">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={nextService}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Next service"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Service Indicators */}
                <div className="flex gap-2 mt-2">
                  {services.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'w-8 bg-gray-900' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to service ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Image Content - Animates */}
              <div ref={imageRef} className="relative aspect-square flex items-center justify-center">
                <img
                  src={currentService.image}
                  alt={currentService.title}
                  className="w-full h-full object-cover rounded-[20px] relative z-10"
                />
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-[20px] flex items-end justify-center overflow-hidden relative shadow-inner">
                  <div 
                    className="w-[70%] h-[85%] rounded-t-full relative transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(to top, ${currentService.color}15, transparent)`
                    }}
                  />
                  {/* Decorative elements */}
                  <div 
                    className="absolute top-10 left-10 w-16 h-16 rounded-full opacity-20"
                    style={{ backgroundColor: currentService.color }}
                  />
                  <div 
                    className="absolute bottom-10 right-10 w-12 h-12 rounded-full opacity-20"
                    style={{ backgroundColor: currentService.color }}
                  />
                </div>
              </div>
            </div>

            {/* Decorative accent - changes color */}
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] flex flex-col gap-2 p-[30px] opacity-20 z-[1]">
              <div className="h-1 rounded-sm transition-all duration-500" style={{ backgroundColor: currentService.color, width: '100%' }} />
              <div className="h-1 rounded-sm transition-all duration-500" style={{ backgroundColor: currentService.color, width: '70%' }} />
              <div className="h-1 rounded-sm transition-all duration-500" style={{ backgroundColor: currentService.color, width: '50%' }} />
            </div>
          </div>

          {/* Service Counter */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm font-medium">
              Service {currentIndex + 1} of {services.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;