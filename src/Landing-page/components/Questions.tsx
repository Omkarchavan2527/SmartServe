import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FAQ } from '../types/index';

const Questions: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.questions-header', {
        scrollTrigger: { trigger: '.questions-header', start: 'top 80%' },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
      });

      gsap.fromTo('.faq-item',
        { y: 30, opacity: 0 }, // fromVars
        { // toVars
        scrollTrigger: { trigger: '.faq-list', start: 'top 75%' },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        onStart: (self) => {
          const item = self.trigger; // The current faq-item element
          // Animate text elements from bottom to top
          gsap.fromTo(item.querySelectorAll('button span, p'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05 });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleFAQ = (index: number): void => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs: FAQ[] = [
    { question: 'How do I book?', answer: 'Simply search for the service you need, browse available workers, and click the "Book Now" button. You\'ll be guided through the booking process step by step.' },
    { question: 'Are workers verified?', answer: 'Yes! All workers on our platform go through a rigorous verification process including background checks, skill assessments, and reference verification to ensure quality service.' },
    { question: 'What if something goes wrong?', answer: 'We have a comprehensive support system. Contact our 24/7 customer service team, and we\'ll help resolve any issues. We also offer insurance coverage for most services.' },
    { question: 'Can I save favorites?', answer: 'Absolutely! Create an account to save your favorite workers, track job history, and get personalized recommendations based on your preferences.' }
  ];

  return (
    <section ref={sectionRef} className="py-[120px] px-[5%] bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="questions-header text-center mb-[60px]">
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-black">Questions</h2>
        </div>

        <div className="max-w-[900px] mx-auto">
          <div className="faq-list flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  activeIndex === index ? 'border-primary-green shadow-sm' : 'border-gray-200 hover:border-primary-green'
                }`}
              >
                <button 
                  className="w-full px-7 py-6 flex justify-between items-center text-left font-body text-[1.0625rem] font-semibold text-gray-900 transition-all duration-300 hover:text-primary-green"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <span className={`
                    w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-light
                    transition-all duration-300 flex-shrink-0 ml-5
                    ${activeIndex === index ? 'bg-primary-green text-white rotate-180' : ''}
                  `}>
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </button>
                
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    activeIndex === index ? 'max-h-[300px] px-7 pb-6' : 'max-h-0 px-7 pb-0'
                  }`}
                >
                  <p className="text-base leading-relaxed text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Questions;