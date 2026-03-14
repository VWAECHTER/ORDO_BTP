import { AlertCircle, Download, Loader, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Metadata {
  objet: string;
  maitrise_oeuvre: string;
  montant: string;
  delais: string;
}

interface DCEDocument {
  piece: string;
  description: string;
}

interface StrategicPillar {
  title: string;
  points: string[];
}

interface BlockingQuestion {
  question: string;
  importance: string;
}

interface AnalysisData {
  metadata: Metadata;
  dce_map: DCEDocument[];
  strategic_analysis: {
    piliers: StrategicPillar[];
  };
  blocking_questions: BlockingQuestion[];
}

interface AnalysisSectionProps {
  projectId: string;
  hasDocuments: boolean;
  onAnalysisComplete: () => void;
}

export function AnalysisSection({ projectId, hasDocuments, onAnalysisComplete }: AnalysisSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-documents`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Échec de l\'analyse des documents');
      }

      const { analysis } = await response.json();
      setAnalysisData(analysis);
      setHasAnalyzed(true);
      onAnalysisComplete();
    } catch (err) {
      console.error('Error analyzing documents:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse des documents');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading analysis as PDF...');
  };

  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!hasDocuments && !hasAnalyzed && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Veuillez d'abord télécharger des documents pour lancer l'analyse
          </p>
        </div>
      )}

      {hasAnalyzed && analysisData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Analyse complétée
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

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                A) Métadonnées de l'Appel d'Offres
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Objet</p>
                  <p className="text-sm text-slate-900">{analysisData.metadata.objet}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Maîtrise d'oeuvre</p>
                  <p className="text-sm text-slate-900">{analysisData.metadata.maitrise_oeuvre}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Montant</p>
                  <p className="text-sm text-slate-900">{analysisData.metadata.montant}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Délais</p>
                  <p className="text-sm text-slate-900">{analysisData.metadata.delais}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                B) Carte du DCE
              </h4>
              <div className="space-y-2">
                {analysisData.dce_map.map((doc, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{doc.piece}</p>
                      <p className="text-xs text-slate-600">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-300 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-slate-700" />
                C) Analyse Stratégique (5 Piliers)
              </h4>
              <div className="space-y-4">
                {analysisData.strategic_analysis.piliers.map((pilier, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-900 mb-3">{pilier.title}</h5>
                    <ul className="space-y-2">
                      {pilier.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                D) Questions Bloquantes
              </h4>
              <div className="space-y-3">
                {analysisData.blocking_questions.map((item, index) => (
                  <div key={index} className="flex items-start justify-between gap-4 p-3 bg-white rounded border border-red-200">
                    <p className="text-sm text-slate-900 flex-1">{item.question}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getImportanceColor(item.importance)}`}>
                      {item.importance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
