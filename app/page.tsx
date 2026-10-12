import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
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

export default function RootHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-300">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBanner />
        <CategoryGrid />
        <TopProviders />
        <PopularAreas />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
