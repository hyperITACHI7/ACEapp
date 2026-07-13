import Header from "../landing/components/Header";
import Hero from "../landing/components/Hero";
import Manifesto from "../landing/components/Manifesto";
import FeaturePanel from "../landing/components/FeaturePanel";
import Marquee from "../landing/components/Marquee";
import FloatingNav from "../landing/components/FloatingNav";
import CTA from "../landing/components/CTA";
import Footer from "../landing/components/Footer";
import { sections } from "../landing/data/sections";

export default function LandingPage() {
  return (
    <div className="folio-landing relative bg-ink">
      <Header />
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
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
