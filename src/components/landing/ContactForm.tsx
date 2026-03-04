import { useState, FormEvent } from 'react';
import { CheckCircle, Shield, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  email: string;
  firstName: string;
  companyName: string;
  structureType: string;
  useCases: string[];
  context: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    companyName: '',
    structureType: '',
    useCases: [],
    context: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const structureTypes = [
    { value: 'tpe', label: 'TPE (moins de 20 salariés)' },
    { value: 'pme', label: 'PME (20 à 250 salariés)' },
    { value: 'bureau_etudes', label: 'Bureau d\'études technique' },
    { value: 'autre', label: 'Autre structure' },
  ];

  const useCaseOptions = [
    { value: 'marches_publics', label: 'Marchés publics (DCE complexes)' },
    { value: 'gros_oeuvre', label: 'Gros œuvre et génie civil' },
    { value: 'ouvrages_art', label: 'Ouvrages d\'art' },
    { value: 'normes_reglementaires', label: 'Conformité normative et réglementaire' },
    { value: 'reduction_risques', label: 'Réduction des risques juridiques' },
  ];

  const handleUseCaseChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(value)
        ? prev.useCases.filter((v) => v !== value)
        : [...prev.useCases, value],
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!formData.companyName.trim()) {
      setError('Le nom de l\'entreprise est requis.');
      return;
    }

    if (!formData.structureType) {
      setError('Veuillez sélectionner un type de structure.');
      return;
    }

    if (formData.useCases.length === 0) {
      setError('Veuillez sélectionner au moins un cadre d\'utilisation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('presentation_requests')
        .insert([
          {
            email: formData.email,
            first_name: formData.firstName || null,
            company_name: formData.companyName,
            structure_type: formData.structureType,
            use_cases: formData.useCases,
            context: formData.context || null,
          },
        ]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setFormData({
        email: '',
        firstName: '',
        companyName: '',
        structureType: '',
        useCases: [],
        context: '',
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-navy-700 mb-2">
              Demande envoyée avec succès
            </h3>
            <p className="text-gray-600 mb-6">
              Nous avons bien reçu votre demande de présentation. Notre équipe vous contactera sous 48h.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Envoyer une autre demande
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy-700 mb-4">
            Demande de présentation
          </h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Découvrez comment ORDO peut structurer et sécuriser vos réponses aux appels d'offres
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-8 shadow-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy-700 mb-2">
                Email professionnel <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                placeholder="votre.email@entreprise.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-navy-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-navy-700 mb-2">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-3">
                Type de structure <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {structureTypes.map((type) => (
                  <label key={type.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="structureType"
                      value={type.value}
                      checked={formData.structureType === type.value}
                      onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                      className="w-4 h-4 text-gold-500 focus:ring-gold-500"
                      required
                    />
                    <span className="ml-3 text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-3">
                Cadre d'utilisation <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {useCaseOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={formData.useCases.includes(option.value)}
                      onChange={() => handleUseCaseChange(option.value)}
                      className="w-4 h-4 text-gold-500 rounded focus:ring-gold-500"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="context" className="block text-sm font-semibold text-navy-700 mb-2">
                Contexte ou attentes spécifiques
              </label>
              <textarea
                id="context"
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors resize-none"
                placeholder="Décrivez brièvement vos besoins ou votre contexte..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-400 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-5 h-5 text-gold-500 mr-2 flex-shrink-0" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-5 h-5 text-gold-500 mr-2 flex-shrink-0" />
                <span>Réponse sous 48h</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-gold-500 mr-2 flex-shrink-0" />
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
