import { AlertCircle, Download, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface CriticalPoint {
  id: number;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface AnalysisSectionProps {
  hasDocuments: boolean;
  onAnalyze: () => Promise<void>;
}

export function AnalysisSection({ hasDocuments, onAnalyze }: AnalysisSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [criticalPoints, setCriticalPoints] = useState<CriticalPoint[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyze();

      const mockPoints: CriticalPoint[] = [
        { id: 1, title: 'Délai de réalisation contraint', description: 'Le délai imposé de 12 mois nécessite une organisation optimale', severity: 'high' },
        { id: 2, title: 'Conformité aux normes NF', description: 'Vérification obligatoire de toutes les normes NF en vigueur', severity: 'high' },
        { id: 3, title: 'Coordination avec les sous-traitants', description: 'Planification rigoureuse des interventions nécessaire', severity: 'medium' },
        { id: 4, title: 'Contraintes environnementales', description: 'Respect des normes environnementales spécifiques au site', severity: 'medium' },
        { id: 5, title: 'Accès au chantier limité', description: 'Les horaires d\'accès sont restreints de 8h à 17h', severity: 'medium' },
        { id: 6, title: 'Qualifications requises', description: 'Certifications spécifiques obligatoires pour le personnel', severity: 'high' },
        { id: 7, title: 'Garanties financières', description: 'Caution de 10% du montant total requise', severity: 'medium' },
        { id: 8, title: 'Assurance décennale', description: 'Justificatifs d\'assurance à fournir avant démarrage', severity: 'high' },
        { id: 9, title: 'Matériaux spécifiques', description: 'Liste de matériaux imposés par le maître d\'ouvrage', severity: 'low' },
        { id: 10, title: 'Reporting hebdomadaire', description: 'Compte-rendu d\'avancement obligatoire chaque semaine', severity: 'low' }
      ];

      setCriticalPoints(mockPoints);
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading analysis as PDF...');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Critique';
      case 'medium': return 'Important';
      case 'low': return 'À surveiller';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Analyse des documents</h3>
        {!hasAnalyzed && (
          <Button
            onClick={handleAnalyze}
            disabled={!hasDocuments || isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              'Lancer l\'analyse'
            )}
          </Button>
        )}
      </div>

      {!hasDocuments && !hasAnalyzed && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Veuillez d'abord télécharger des documents pour lancer l'analyse
          </p>
        </div>
      )}

      {hasAnalyzed && criticalPoints.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              {criticalPoints.length} points critiques identifiés
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger en PDF
            </Button>
          </div>

          <div className="space-y-3">
            {criticalPoints.map(point => (
              <div
                key={point.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-slate-400">#{point.id}</span>
                      <h4 className="font-semibold text-slate-900">{point.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600">{point.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityColor(point.severity)}`}>
                    {getSeverityLabel(point.severity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
