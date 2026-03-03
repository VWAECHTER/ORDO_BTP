import { FileText, Download, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface TechnicalMemoSectionProps {
  hasAnalysis: boolean;
  onGenerate: () => Promise<void>;
}

export function TechnicalMemoSection({ hasAnalysis, onGenerate }: TechnicalMemoSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [memoContent, setMemoContent] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();

      const mockContent = `# MÉMOIRE TECHNIQUE

## 1. PRÉSENTATION DE L'ENTREPRISE

Notre entreprise forte de 25 ans d'expérience dans le secteur du BTP, dispose de toutes les qualifications nécessaires pour mener à bien ce projet d'envergure.

## 2. COMPRÉHENSION DU PROJET

Nous avons analysé en détail le dossier de consultation et identifié les points clés suivants :
- Respect des délais contraints
- Conformité aux normes en vigueur
- Coordination optimale des équipes

## 3. MOYENS TECHNIQUES

### 3.1 Matériel
- Équipement moderne et entretenu
- Matériel de sécurité conforme
- Outillage spécialisé

### 3.2 Personnel
- 15 compagnons qualifiés
- 3 chefs de chantier expérimentés
- 1 conducteur de travaux dédié

## 4. MÉTHODOLOGIE D'EXÉCUTION

### 4.1 Planning
Phase préparatoire : 2 semaines
Phase d'exécution : 10 mois
Phase de finition : 2 semaines

### 4.2 Organisation du chantier
- Installation de chantier optimisée
- Gestion des flux optimale
- Sécurité renforcée

## 5. QUALITÉ ET SÉCURITÉ

### 5.1 Démarche qualité
- Contrôles à chaque étape
- Documentation complète
- Traçabilité totale

### 5.2 Sécurité
- Plan de prévention détaillé
- Formation continue du personnel
- Équipements de protection individuels

## 6. DÉVELOPPEMENT DURABLE

- Gestion des déchets optimisée
- Utilisation de matériaux durables
- Réduction de l'empreinte carbone

## 7. RÉFÉRENCES

Nous avons réalisé plus de 50 chantiers similaires ces 5 dernières années avec un taux de satisfaction client de 98%.`;

      setMemoContent(mockContent);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading memo as PDF...');
  };

  const handleDownloadWord = () => {
    console.log('Downloading memo as Word...');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mémoire technique</h3>
        {!hasGenerated && (
          <Button
            onClick={handleGenerate}
            disabled={!hasAnalysis || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Générer le mémoire
              </>
            )}
          </Button>
        )}
      </div>

      {!hasAnalysis && !hasGenerated && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Veuillez d'abord effectuer l'analyse pour générer le mémoire technique
          </p>
        </div>
      )}

      {hasGenerated && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-2 flex-1"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadWord}
              className="gap-2 flex-1"
            >
              <Download className="w-4 h-4" />
              Télécharger Word
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                {memoContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
