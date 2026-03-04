import { Building2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-500 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-gold-400" />
            <span className="text-2xl font-bold text-white">ORDO</span>
          </div>

          <p className="text-gray-300 text-sm max-w-md">
            Solution d'excellence méthodologique pour les professionnels du BTP
          </p>

          <div className="border-t border-navy-400 pt-6 w-full">
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <strong className="text-white">IA EXENCE SOLUTIONS</strong>, SAS
              </p>
              <p>RCS Narbonne 927 524 165</p>
              <p>
                <a
                  href="https://ordo.ia-exence-solutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 transition-colors underline"
                >
                  ordo.ia-exence-solutions.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gold-400 transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-gold-400 transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-gold-400 transition-colors">
              CGV
            </a>
          </div>

          <div className="text-sm text-gray-400">
            &copy; {currentYear} ORDO BTP. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
