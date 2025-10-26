import React from "react";
import { FlipWords } from "../../ui/flip-words";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import About from "./AboutUs";
import WhatMakes from "./WhatMakes";
import { aboutUsData, ourMissionData, ourStoryData } from "@/app/data/AboutUsData";

export default function AboutMakes() {

  return (
    <section
      id="about"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      <About/>
      <WhatMakes/>
    </section>
  );
}
