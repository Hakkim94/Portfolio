"use client";
import { ArrowRight } from "lucide-react";
const Button = ({ children, variant = 'primary', href }: any) => {
  const baseStyles = "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 group";
  const variants: any = {
    primary: "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 shadow-lg shadow-yellow-500/25",
    secondary: "border border-white/20 text-white hover:bg-white/5 hover:border-white/40",
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${baseStyles} ${variants[variant] || variants.primary}`}>
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-45deg]" strokeWidth={2} />
    </a>
  );
};
export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-4 bg-black/50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Projects</span>
        </h2>
        <div className="text-center text-white/60 py-12">
          <p className="text-xl">🚀 Projects coming soon...</p>
        </div>
      </div>
    </section>
  );
}
