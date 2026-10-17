import React, { useState } from 'react';
import { MikkysLogo } from '../MikkysLogo';

interface OnboardingWalkthroughProps {
  onComplete: () => void;
}

export const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState<number>(0);

  const slides = [
    {
      type: 'splash',
      image: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
      headline: 'Look Good.\nFeel Better.',
      subtext: 'Premium cuts  •  Fresh styles  •  Always',
      button: 'Enter App',
    },
    {
      type: 'slide',
      image: '/src/assets/images/haircut_fade_classic_1792138006925.jpg',
      title: 'Professional Barbers.',
      titleRed: 'Sharp Styles.',
      description: 'Get the best grooming experience with skilled barbers and top-notch services.',
      button: 'Next',
    },
    {
      type: 'slide',
      image: '/src/assets/images/barber_tools_craft_1792138007201.jpg',
      title: 'Quality Service.',
      titleRed: 'Every Time.',
      description: "From fresh fades to clean shaves, we've got you covered.",
      button: 'Next',
    },
    {
      type: 'slide',
      image: '/src/assets/images/barbershop_hero_1792138005555.jpg',
      title: 'Your Style.',
      titleRed: 'Our Priority.',
      description: 'Book your appointment, choose your service and get ready to look your best.',
      button: 'Get Started',
    },
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative h-full w-full bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Photography with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt="Barbershop showcase"
          className="h-full w-full object-cover object-center brightness-60 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/40" />
      </div>

      {/* Top Header / Skip Button */}
      <div className="relative z-10 pt-12 px-6 flex items-center justify-between">
        <div className="w-12" /> {/* Spacer */}
        {slide === 0 ? (
          <MikkysLogo size="md" />
        ) : (
          <div className="scale-75 origin-top">
            <MikkysLogo size="sm" />
          </div>
        )}
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-neutral-300 hover:text-white px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Middle/Bottom Content */}
      <div className="relative z-10 px-6 pb-12 space-y-6">
        {slide === 0 ? (
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white whitespace-pre-line leading-tight">
              {current.headline}
            </h1>
            <p className="text-xs tracking-wider text-neutral-300 uppercase font-medium">
              {current.subtext}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              {current.title}{' '}
              <span className="text-red-600 block">{current.titleRed}</span>
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-xs">
              {current.description}
            </p>

            {/* Dot indicators (Screens 2, 3, 4) */}
            <div className="flex items-center gap-2 pt-2">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    slide === idx ? 'w-6 bg-red-600' : 'w-1.5 bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleNext}
            className="w-full rounded-2xl bg-red-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:bg-red-700 active:scale-98 transition-all"
          >
            {current.button}
          </button>
        </div>
      </div>
    </div>
  );
};
