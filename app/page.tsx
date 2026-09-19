import { Hero } from "@/components/home/Hero";
import { CalculatorGrid } from "@/components/home/CalculatorGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Transparency } from "@/components/home/Transparency";
import { TravelTeaser } from "@/components/home/TravelTeaser";
import { MoreTools } from "@/components/home/MoreTools";
import { FinalCta } from "@/components/home/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CalculatorGrid />
      <HowItWorks />
      <TravelTeaser />
      <MoreTools />
      <Transparency />
      <FinalCta />
    </>
  );
}
