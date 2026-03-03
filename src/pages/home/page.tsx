
import HeroSection from './components/HeroSection';
import CoreValuesSection from './components/CoreValuesSection';
import WorkflowSection from './components/WorkflowSection';
import DemoSection from './components/DemoSection';
import StatsSection from './components/StatsSection';
import TrendingSpacesSection from './components/TrendingSpacesSection';
import RecentCommentsSection from './components/RecentCommentsSection';
import PopularCommentsSection from './components/PopularCommentsSection';
import B2BSection from './components/B2BSection';
import TestimonialSection from './components/TestimonialSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-50">
      <HeroSection />
      <TrendingSpacesSection />
      <RecentCommentsSection />
      <PopularCommentsSection />
      <CoreValuesSection />
      <WorkflowSection />
      <DemoSection />
      <StatsSection />
      <B2BSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
}
