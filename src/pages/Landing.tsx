import OrdoHeader from '../components/landing/OrdoHeader';
import HeroSection from '../components/landing/HeroSection';
import MethodologySection from '../components/landing/MethodologySection';
import TargetAudienceSection from '../components/landing/TargetAudienceSection';
import ContactForm from '../components/landing/ContactForm';
import Footer from '../components/landing/Footer';

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <OrdoHeader />
      <HeroSection />
      <MethodologySection />
      <TargetAudienceSection />
      <ContactForm />
      <Footer />
    </div>
  );
}
