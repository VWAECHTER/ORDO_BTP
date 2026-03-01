import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Building, Construction, HardHat } from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    id: 'gros-oeuvre',
    name: 'Gros-oeuvre / Bâtiment',
    icon: Building,
    description: 'Marchés de construction et rénovation de bâtiments',
    color: 'bg-blue-500'
  },
  {
    id: 'genie-civil',
    name: 'Génie Civil',
    icon: HardHat,
    description: 'Infrastructures et travaux de génie civil',
    color: 'bg-green-500'
  },
  {
    id: 'ouvrages-art',
    name: 'Ouvrages d\'Art / Pont',
    icon: Construction,
    description: 'Construction et maintenance de ponts et ouvrages d\'art',
    color: 'bg-orange-500'
  }
];

export function AppelOffres() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <AppLayout
      title="Appel d'Offres"
      description="Gérez vos appels d'offres par catégorie"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <Card
                key={category.id}
                hover
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-slate-900 shadow-lg' : ''
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <div className="p-6">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {category.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedCategory && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="space-y-4">
                <div className="text-center py-12 text-slate-500">
                  <p>Aucun appel d'offres pour le moment</p>
                  <p className="text-sm mt-2">Les appels d'offres apparaîtront ici</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
