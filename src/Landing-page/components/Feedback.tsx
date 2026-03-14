import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import type { Testimonial } from '../types/index';

const Feedback: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feedback-header', {
        scrollTrigger: { trigger: '.feedback-header', start: 'top 80%' },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
      });

      gsap.fromTo('.testimonial-card', {
        scrollTrigger: { trigger: '.testimonials-grid', start: 'top 75%' },
        y: 60, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
      }, { // toVars
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials: Testimonial[] = [
    { name: 'Jennifer Lewis', role: 'Homeowner', text: 'Great service! Found an electrician within minutes. Professional and reliable.', rating: 5, color: '#f77f00' },
    { name: 'Mike Johnson', role: 'Business Owner', text: 'The plumber arrived on time and fixed the issue quickly. Highly recommend!', rating: 5, color: '#2a7f6a' },
    { name: 'Susan Wilson', role: 'Property Manager', text: 'Best platform for finding skilled workers. Makes my job so much easier.', rating: 5, color: '#e63946' }
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-30 px-[5%] bg-white">
      <div className="max-w-350 mx-auto">
        <div className="feedback-header text-center mb-10 md:mb-15">
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-black mb-4">Real feedback</h2>
          <p className="text-lg text-gray-600">What people are saying</p>
        </div>

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card bg-white rounded-[15px] md:rounded-[20px] p-6 md:p-8 shadow-md relative overflow-hidden transition-all duration-400 border-2 border-transparent hover:-translate-y-2 hover:shadow-lg group"
              style={{ '--card-color': testimonial.color } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = testimonial.color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
                <div className="shrink-0">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${testimonial.color}, rgba(0,0,0,0.1))` }}
                  >
                    <div className="absolute w-full h-full bg-radial-gradient" style={{
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)`
                    }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base md:text-lg text-gray-900 mb-1 truncate">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3 md:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg md:text-xl">★</span>
                ))}
              </div>

              <p className="text-sm md:text-base leading-relaxed text-gray-600 relative z-2">{testimonial.text}</p>

              <div
                className="absolute -bottom-5 md:-bottom-7.5 -right-5 md:-right-7.5 w-25 md:w-30 h-25 md:h-30 rounded-full opacity-5 transition-all duration-400 group-hover:scale-150 group-hover:opacity-10"
                style={{ backgroundColor: testimonial.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feedback;