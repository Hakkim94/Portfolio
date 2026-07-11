// components/ContactSection.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// SVG Icons
const Icons = {
  Mail: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Github: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Linkedin: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
};

// Contact data
const contactLinks = [
  {
    id: "email",
    label: "Email",
    href: "mailto:hakkim0948@gmail.com",
    icon: Icons.Mail,
    description: "Get in touch directly",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/hakkim94",
    icon: Icons.Github,
    description: "View my code",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hakkim-mubarak-41415024a ",
    icon: Icons.Linkedin,
    description: "Connect professionally",
  },
  {
    id: "resume",
    label: "Resume",
    href: "/Resume/Hakkim_Mubarak_Resume.pdf",
    icon: Icons.FileText,
    description: "Download my CV",
  },
];

// Individual Contact Row Component
function ContactRow({
  link,
}: {
  link: typeof contactLinks[0];
}) {
  const Icon = link.icon;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-row group relative block py-6 md:py-8 border-b border-white/5 transition-all duration-500 hover:border-white/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          {/* Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#F8C61E]/10 transition-all duration-500">
            <Icon />
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-white group-hover:text-[#F8C61E] transition-all duration-500">
              {link.label}
            </h3>
            <p className="text-sm md:text-base text-white/40 group-hover:text-white/60 transition-all duration-500">
              {link.description}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <Icons.ArrowRight />
      </div>

      {/* Background hover effect */}
      <div className="absolute inset-0 -z-10 bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
    </a>
  );
}

// Main Contact Section
export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const paragraph = paragraphRef.current;
    const links = linksRef.current;
    const cta = ctaRef.current;
    const glow = glowRef.current;

    if (!section || !headline || !paragraph || !links || !cta) return;

    const ctx = gsap.context(() => {
      // Glow animation - subtle floating
      gsap.to(glow, {
        x: "10%",
        y: "-10%",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Headline animation
      gsap.fromTo(
        headline,
        { opacity: 0, y: 80, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Paragraph animation
      gsap.fromTo(
        paragraph,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Contact rows stagger animation
      const rows = links.querySelectorAll(".contact-row");
      gsap.fromTo(
        rows,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // CTA button animation
      gsap.fromTo(
        cta,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          delay: 0.9,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen bg-[#0B0B0B] text-white overflow-hidden flex items-center"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating glow */}
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#F8C61E]/5 blur-3xl"
        />

        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2YpIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-4xl">
          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.05] tracking-tight"
          >
            LET'S BUILD
            <br />
            SOMETHING
            <br />
            <span className="text-[#F8C61E]">AMAZING.</span>
          </h1>

          {/* Paragraph */}
          <p
            ref={paragraphRef}
            className="mt-8 md:mt-12 text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl leading-relaxed"
          >
            Whether you have a project, an idea, or just want to say hello,
            I'd love to hear from you.
          </p>

          {/* Contact Links */}
          <div
            ref={linksRef}
            className="mt-16 md:mt-20 space-y-0 max-w-2xl"
          >
            {contactLinks.map((link) => (
              <ContactRow key={link.id} link={link} />
            ))}
          </div>

          {/* CTA Button */}
          <div ref={ctaRef} className="mt-12 md:mt-16">
            <a
              href="mailto:your.email@example.com"
              className="group inline-flex items-center gap-4 px-10 md:px-12 py-5 md:py-6 bg-[#F8C61E] text-[#0B0B0B] font-semibold text-lg md:text-xl rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#F8C61E]/25"
            >
              Say Hello
              <span className="transition-transform duration-500 group-hover:translate-x-2 group-hover:rotate-[-45deg]">
                <Icons.ArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/20">
          <span>© 2026 Hakkim Mubarak</span>
          <span className="hidden sm:inline">•</span>
          <span>Designed & Developed by Me.</span>
        </div>
      </div>
    </section>
  );
}