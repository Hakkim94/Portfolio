import ImageSequence from "@/components/ImageSequence";
import About from "@/components/About";
import TechStack from "@/components/TechStack";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
export default function Home() {
  return (
    <>
    
      <ImageSequence />
      <About />
      <ProjectsSection />
      <TechStack />
        <ContactSection />
    </>
  );
}