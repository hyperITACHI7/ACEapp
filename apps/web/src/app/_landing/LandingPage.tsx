"use client";

import Header from "./Header";
import Hero from "./Hero";
import Manifesto from "./Manifesto";
import FeaturePanel from "./FeaturePanel";
import Marquee from "./Marquee";
import FloatingNav from "./FloatingNav";
import CTA from "./CTA";
import Footer from "./Footer";
import { sections } from "./data/sections";

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="folio-landing relative bg-ink">
      <Header isLoggedIn={isLoggedIn} />
      <FloatingNav />
      <main>
        <Hero />
        <Manifesto />
        {sections.map((section, i) => (
          <div key={section.id}>
            <FeaturePanel section={section} index={i} />
            {i === 1 && <Marquee />}
          </div>
        ))}
        <CTA isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </div>
  );
}
