"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import ScrollSequence from "@/components/ScrollSequence";
import TechnologySection3D from "@/components/TechnologySection3D";
import Specs from "@/components/Specs";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Loader onLoaded={() => setReady(true)} />
      <SmoothScroll />
      <Cursor />
      <ScrollProgress />
      <Navbar />

      <main style={{ background: "var(--bg)" }}>
        <ScrollSequence ready={ready} />
        <TechnologySection3D />
        <Specs />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
