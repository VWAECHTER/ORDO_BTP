import { Check, X } from 'lucide-react';

const relevantFor = [
  'TPE et PME du BTP soumissionnant à des marchés publics',
  'Bureaux d\'études techniques spécialisés',
  'Entreprises confrontées à des exigences réglementaires élevées',
  'Structures recherchant une méthodologie rigoureuse pour leurs réponses',
];

const notIntendedFor = [
  'Particuliers ou auto-entrepreneurs occasionnels',
  'Projets sans contraintes réglementaires spécifiques',
  'Entreprises recherchant uniquement une solution de rédaction automatique',
];

export default function TargetAudienceSection() {
  return (
    <section id="cible" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-navy-700 mb-4">
            À qui s'adresse ORDO ?
          </h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border-2 border-green-200 p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-navy-700">Pertinent si</h3>
            </div>
            <ul className="space-y-4">
              {relevantFor.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-200 p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <X className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-navy-700">Pas destiné à</h3>
            </div>
            <ul className="space-y-4">
              {notIntendedFor.map((item, index) => (
                <li key={index} className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
