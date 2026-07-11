"use client";

import { ArrowRight } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link: string;
  github?: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce platform with payment integration, user authentication, and admin dashboard.",
    technologies: ["React", "Next.js", "Tailwind", "Stripe"],
    image: "/projects/ecommerce.jpg",
    link: "https://example.com",
    github: "https://github.com",
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative task management tool with real-time updates, team workspaces, and progress tracking.",
    technologies: ["React", "Firebase", "Tailwind", "Framer Motion"],
    image: "/projects/taskapp.jpg",
    link: "https://example.com",
    github: "https://github.com",
  },
  {
    id: "3",
    title: "Portfolio Website",
    description: "A modern, animated portfolio website with GSAP animations, ScrollTrigger, and 3D elements.",
    technologies: ["Next.js", "GSAP", "Tailwind", "Three.js"],
    image: "/projects/portfolio.jpg",
    link: "https://example.com",
    github: "https://github.com",
  },
];

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  href: string;
}

const Button = ({ children, variant = 'primary', href }: ButtonProps) => {
  const baseStyles = "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 group";
  
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 shadow-lg shadow-yellow-500/25",
    secondary: "border border-white/20 text-white hover:bg-white/5 hover:border-white/40",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variants[variant] || variants.primary}`}
    >
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-45deg]" strokeWidth={2} />
    </a>
  );
};

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-4 bg-black/50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Projects
          </span>
        </h2>
        <p className="text-center text-white/40 mb-12">Some of my recent work</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/10"
            >
              <div className="h-48 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="text-white/20 text-sm relative z-10">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button href={project.link} variant="primary">View Project</Button>
                  {project.github && (
                    <Button href={project.github} variant="secondary">GitHub</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
