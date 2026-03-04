import { useState } from 'react';
import { Menu, X, Building2 } from 'lucide-react';

export default function OrdoHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-navy-600" />
            <span className="text-xl font-bold text-navy-700">ORDO BTP</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('methode')}
              className="text-gray-700 hover:text-navy-600 transition-colors font-medium"
            >
              Méthode
            </button>
            <button
              onClick={() => scrollToSection('cible')}
              className="text-gray-700 hover:text-navy-600 transition-colors font-medium"
            >
              Cible
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Demander une présentation
            </button>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-navy-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('methode')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Méthode
            </button>
            <button
              onClick={() => scrollToSection('cible')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cible
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors font-medium text-center"
            >
              Demander une présentation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
