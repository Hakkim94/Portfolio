"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const about = aboutRef.current;

    if (!section || !about) return;

    // ============================================
    // ABOUT PANEL SLIDE UP EFFECT
    // ============================================
    gsap.fromTo(
      about,
      {
        y: "100vh",
        borderRadius: "60px 60px 0 0",
      },
      {
        y: 0,
        borderRadius: "60px 60px 0 0",
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      }
    );

    // ============================================
    // TEXT ANIMATIONS
    // ============================================
    gsap.fromTo(
      ".about-title",
      {
        opacity: 0,
        y: 30,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power4.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 40%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );

    gsap.fromTo(
      ".about-line",
      {
        scaleX: 0,
        transformOrigin: "left",
      },
      {
        scaleX: 1,
        duration: 1,
        ease: "power4.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top 35%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );

    gsap.fromTo(
      ".story",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power4.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "top 30%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-30 min-h-screen flex items-center overflow-visible"
      style={{ marginTop: "-2px" }}
    >
      <div
        ref={aboutRef}
        className="w-full min-h-screen bg-[#F8C61E] text-[#252C37] flex items-center rounded-t-[60px]"
        style={{
          transform: "translateY(100vh)",
        }}
      >
        <div className="mx-auto max-w-6xl px-10 py-16">
          <p className="about-title text-sm tracking-[25px] uppercase text-black">
            Who I Am
          </p>

          <div className="about-line mt-6 h-[2px] w-32 bg-black rounded-full" />

          <div className="mt-16 space-y-10">
            <h2 className="story text-5xl md:text-6xl font-black leading-tight">
              I don't just build websites.
              <br />
              I build experiences.
            </h2>

            <p className="story text-xl md:text-2xl max-w-4xl leading-relaxed">
              I'm a Full Stack Developer who enjoys turning
              ideas into real, functional products using
              Java, Spring Boot, React, and Next.js.
            </p>

            <p className="story text-xl md:text-2xl max-w-4xl leading-relaxed">
              I enjoy solving real-world problems,
              writing clean code, and designing
              applications that feel intuitive,
              reliable, and enjoyable to use.
            </p>

            <p className="story text-xl md:text-2xl max-w-4xl leading-relaxed">
              Every project is an opportunity to learn.
              I'm constantly exploring AI-powered
              workflows, modern technologies,
              and new ways to create meaningful
              digital experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}