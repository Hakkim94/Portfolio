"use client";

import { useRef } from "react";
import useReveal from "@/hooks/useReveal";

const techCards = [
  {
    title: "Frontend",
    bg: "bg-[#0F172A]",
    text: "text-white",
    description: "Creating responsive and modern user interfaces.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
     
    ],
  },
  {
    title: "Backend",
    bg: "bg-[#F8C61E]",
    text: "text-[#252C37]",
    description: "Building scalable backend applications.",
    skills: ["Java", "Spring Boot", "REST API", "Maven"],
  },
  {
    title: "Database",
    bg: "bg-white",
    text: "text-black",
    description: "Designing efficient relational databases.",
    skills: ["SQL", "MySQL"],
  },
  {
    title: "Development",
    bg: "bg-[#1F2937]",
    text: "text-white",
    description: "Modern development workflow and testing.",
    skills: ["GitHub", "Linux", "Postman"],
  },
  {
    title: "Deployment",
    bg: "bg-black",
    text: "text-white",
    description: "Deploying applications to production.",
    skills: ["Docker", "Render"],
  },
];

export default function TechStack() {
  // Call the hook inside the component
  const sectionRef = useReveal();

  return (
    <section
      ref={sectionRef}
      id="tech"
      className="relative z-30 -mt-16 min-h-screen bg-[#ECECEC] rounded-t-[50px] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 py-24">
        <p className="uppercase tracking-[10px] text-gray-500">
          Technologies
        </p>

        <h2 className="mt-6 text-6xl font-black text-black">
          Tech Stack
        </h2>

        <p className="mt-5 text-xl text-gray-600 max-w-2xl">
          The technologies I use to design, build and deploy
          modern full-stack applications.
        </p>

        <div className="mt-20 flex gap-8 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
          {techCards.map((card) => (
            <div
              key={card.title}
              className={`
                ${card.bg}
                ${card.text}
                min-w-[420px]
                h-[580px]
                rounded-[40px]
                p-12
                flex
                flex-col
                justify-between
                snap-center
                transition-all
                duration-500
                hover:scale-[1.03]
              `}
            >
              <div>
                <h3 className="text-5xl font-black">
                  {card.title}
                </h3>

                <div className="mt-12 space-y-5">
                  {card.skills.map((skill) => (
                    <p
                      key={skill}
                      className="text-2xl font-semibold"
                    >
                      {skill}
                    </p>
                  ))}
                </div>
              </div>

              <p className="text-lg opacity-80 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}