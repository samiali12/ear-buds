"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import ScrollSequence from "@/components/ScrollSequence";
import Features from "@/components/Features";
import Specs from "@/components/Specs";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Grain from "@/components/Grain";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Loader onLoaded={() => setReady(true)} />
      <SmoothScroll />
      <Cursor />
      <Grain />
      <ScrollProgress />
      <Navbar />

      <main style={{ background: "var(--bg)" }}>
        <ScrollSequence ready={ready} />

        <Features />
        <Specs />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
