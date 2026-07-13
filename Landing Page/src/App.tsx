import Header from "./components/Header";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import FeaturePanel from "./components/FeaturePanel";
import Marquee from "./components/Marquee";
import FloatingNav from "./components/FloatingNav";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { sections } from "./data/sections";

export default function App() {
  return (
    <div className="relative bg-ink">
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
