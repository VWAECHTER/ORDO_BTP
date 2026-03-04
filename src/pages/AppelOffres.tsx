import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Building, Construction, HardHat, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { FileUpload } from '../components/appel-offres/FileUpload';
import { AnalysisSection } from '../components/appel-offres/AnalysisSection';
import { TechnicalMemoSection } from '../components/appel-offres/TechnicalMemoSection';
import { ChatDialog } from '../components/appel-offres/ChatDialog';

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
  const [hasDocuments, setHasDocuments] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [hasMemo, setHasMemo] = useState(false);

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setHasDocuments(true);
    }
  };

  const handleAnalyze = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasAnalysis(true);
  };

  const handleGenerateMemo = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasMemo(true);
  };

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
                onClick={() => setSelectedCategory(category.id)}
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
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FolderOpen className="w-6 h-6 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Dossier marché (DCE)
                    </h3>
                    <FileUpload onFilesChange={handleFilesChange} />
                  </div>

                  <div className="border-t border-slate-200 pt-8">
                    <AnalysisSection
                      hasDocuments={hasDocuments}
                      onAnalyze={handleAnalyze}
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-8">
                    <TechnicalMemoSection
                      hasAnalysis={hasAnalysis}
                      onGenerate={handleGenerateMemo}
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-8">
                    <ChatDialog hasMemo={hasMemo} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
