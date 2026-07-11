"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { button } from "framer-motion/client";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 0,
    title: "Smart Blood Alert System",
    description:
      "AI-powered emergency blood donor management platform that connects hospitals and donors using intelligent location-based matching.",
    tech: ["Java", "Spring Boot", "React", "REST api", "MySQL"],
    image: "/images/project1.png",
    liveDemo: "https://springboot-render-2-b219.onrender.com/",
    github: "https://github.com/Hakkim94/springboot-render",
    number: "01",
  },
  
  {
    id: 1,
    title: "Library Management System",
    description:
      "Desktop application for managing books, students, and issue records.",
    tech: ["Java", "Swing", "JDBC", "MySQL"],
    image: "/projects/library-system.jpg",
    button: false,
    number: "02",
  },
];

function Button({ children, variant = "primary", href }: any) {
  const baseStyles =
    "group relative inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300 rounded-full overflow-hidden";
  const variants = {
    primary:
      "bg-[#F8C61E] text-[#111111] hover:bg-[#e6b41a] hover:scale-105 hover:shadow-2xl hover:shadow-[#F8C61E]/20",
    secondary:
      "border-2 border-white/20 text-white hover:border-[#F8C61E] hover:bg-[#F8C61E]/10 hover:scale-105",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variants[variant]}`}
    >
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-45deg]" strokeWidth={2} />
    </a>
  );
}

function ProjectCard({ project, index }: any) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const techRef = useRef(null);
  const numberRef = useRef(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const tech = techRef.current;
    const number = numberRef.current;

    if (!section || !image || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(section, { opacity: 0, y: 100 }, {
        opacity: 1, y: 0, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" }
      });

      gsap.fromTo(number, { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" }
      });

      gsap.fromTo(title, { opacity: 0, y: 40, filter: "blur(10px)" }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" }
      });

      gsap.fromTo(description, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" }
      });

      const techItems = tech?.querySelectorAll(".tech-badge");
      if (techItems) {
        gsap.fromTo(techItems, { opacity: 0, y: 20, scale: 0.8 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)",
          scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" }
        });
      }

      gsap.to(image, {
        scale: 1.05, duration: 1.5, ease: "power1.out",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full flex items-center justify-center px-6 lg:px-12 py-16">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div ref={imageRef} className={`${isEven ? "lg:order-1" : "lg:order-2"} relative group cursor-pointer`}>
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/0 shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />
            <Image src={project.image} alt={project.title} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" quality={100} priority={index === 0} />
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/80 backdrop-blur-sm flex items-center px-4 gap-2 z-20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-0.5 bg-white/10 rounded-full text-[10px] text-white/60">{project.title}</div>
              </div>
            </div>
          </div>
        </div>

        <div ref={contentRef} className={`${isEven ? "lg:order-2" : "lg:order-1"} space-y-8 lg:space-y-10`}>
          <span ref={numberRef} className="inline-block text-sm tracking-[8px] text-[#F8C61E] font-medium">PROJECT {project.number}</span>
          <h2 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">{project.title}</h2>
          <p ref={descriptionRef} className="text-base sm:text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg">{project.description}</p>
          <div ref={techRef} className="flex flex-wrap gap-2.5 pt-2">
            {project.tech.map((tech: string) => (
              <span key={tech} className="tech-badge px-4 py-1.5 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm">{tech}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-4">

  {project.liveDemo && (
    <Button href={project.liveDemo}>
      Live Demo
    </Button>
  )}

  {project.github && (
    <Button href={project.github} variant="secondary">
      GitHub
    </Button>
  )}

</div>
        </div>
      </div>
    </section>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="relative bg-[#111111] text-white overflow-hidden">
      <div className="sticky top-0 z-10 pt-20 pb-12 px-6 lg:px-12 bg-gradient-to-b from-[#111111] via-[#111111]/95 to-transparent">
        <div className="max-w-7xl mx-auto">
          <span className="text-sm tracking-[8px] text-[#F8C61E] font-medium uppercase">Portfolio</span>
          <h2 className="text-5xl lg:text-7xl font-bold mt-2 tracking-tight">Featured Projects</h2>
          <div className="w-20 h-1 bg-[#F8C61E] mt-4 rounded-full" />
        </div>
      </div>
      <div className="space-y-0">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
      <div className="h-32 bg-gradient-to-t from-[#111111] to-transparent" />
    </section>
  );
}