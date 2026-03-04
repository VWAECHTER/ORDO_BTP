import { useEffect, useRef, useState } from 'react';
import { Layers, CheckCircle, Lock } from 'lucide-react';

const pillars = [
  {
    icon: Layers,
    title: 'STRUCTURER',
    description: 'Organisez vos réponses selon les attentes réglementaires et normatives, en garantissant la traçabilité de chaque élément technique.',
  },
  {
    icon: CheckCircle,
    title: 'VÉRIFIER',
    description: 'Validez la cohérence entre vos documents techniques, vos engagements contractuels et les exigences du cahier des charges.',
  },
  {
    icon: Lock,
    title: 'SÉCURISER',
    description: 'Identifiez les points critiques et minimisez les risques juridiques et techniques avant la soumission de votre offre.',
  },
];

export default function MethodologySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="methode" ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-navy-700 mb-4">
            Une méthodologie en 3 piliers
          </h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className={`bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  isVisible ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-gold-400" />
                </div>
                <h3 className="text-2xl font-bold text-navy-700 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
