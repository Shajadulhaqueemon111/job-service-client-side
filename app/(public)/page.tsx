import { Hero } from "@/components/home/Hero";
import { StatsBanner } from "@/components/home/StatsBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TopProviders } from "@/components/home/TopProviders";
import { PopularAreas } from "@/components/home/PopularAreas";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata = {
  title: "ShebaBD - Local Service Finder Marketplace for Bangladesh",
  description:
    "Find trusted plumbers, electricians, tutors, AC repair, cleaning, and appliance technicians near you across 64 districts in Bangladesh.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <StatsBanner />
      <CategoryGrid />
      <TopProviders />
      <PopularAreas />
      <HowItWorks />
    </div>
  );
}
