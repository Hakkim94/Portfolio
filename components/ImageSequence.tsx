"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Get base path for GitHub Pages
const basePath = process.env.NODE_ENV === 'production' ? '/Portfolio' : '';

export default function ImageSequence() {
  const heroRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const photo = photoRef.current;
    const name = nameRef.current;
    const role = roleRef.current;

    if (!hero || !photo || !name || !role) return;

    const introTimeline = gsap.timeline({
      defaults: {
        duration: 1.5,
        ease: "power4.out",
      },
    });

    introTimeline.fromTo(
      photo,
      {
        opacity: 0,
        scale: 0.7,
        filter: "blur(15px)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.8,
        ease: "power4.out",
      },
      0
    );

    introTimeline.fromTo(
      name,
      {
        opacity: 0,
        y: 60,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power4.out",
      },
      0.2
    );

    introTimeline.fromTo(
      role,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      0.5
    );

    gsap.to("body", {
      backgroundColor: "#140A2D",
      ease: "none",
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "top center",
        scrub: true,
      },
    });

    return () => {
      introTimeline.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="hero relative h-screen w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a0a2e]" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          
          <div className="flex-1 text-center lg:text-left">
            <h1
              ref={nameRef}
              className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tight"
            >
              <span className="text-white">HAKKIM</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 bg-clip-text text-transparent">
                MÜBARAK
              </span>
            </h1>
            <p
              ref={roleRef}
              className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-white/70"
            >
              Full Stack Developer
            </p>
          </div>

          <div ref={photoRef} className="flex-1 flex justify-center items-center">
            <div className="relative">
              <div className="w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] md:w-[380px] md:h-[380px] lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-yellow-500/20 bg-white/5">
                <img
                  src={process.env.NODE_ENV === 'production' ? '/Portfolio/profile.jpg' : '/profile.jpg'}
                  alt="Hakkim Mubarak"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 55%' }}
                />
              </div>
              <div className="absolute inset-[-8px] sm:inset-[-10px] lg:inset-[-12px] rounded-full border border-yellow-500/20" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 blur-2xl -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
