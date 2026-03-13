import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  FileText,
  Mic,
  ArrowRight,
  FolderOpen,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [appelOffresCount, setAppelOffresCount] = useState(0);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  const hour = new Date().getHours();
  let greeting = 'Bonjour';
  if (hour >= 18) greeting = 'Bonsoir';
  else if (hour < 6) greeting = 'Bonne nuit';

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: meetings } = await supabase
        .from('meeting_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: meetingsCountResult } = await supabase
        .from('meeting_recordings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setAppelOffresCount(projectsCount || 0);
      setMeetingsCount(meetingsCountResult || 0);
      setRecentProjects(projects || []);
      setRecentMeetings(meetings || []);
    };

    loadDashboardData();
  }, [user?.id]);

  return (
    <AppLayout
      title="Tableau de bord"
      description={`${greeting}, ${displayName}. Gérez vos appels d'offres et réunions.`}
    >
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{appelOffresCount}</p>
            <p className="text-sm text-slate-500 mt-1">Appels d'offres</p>
            <Link to="/appel-offres">
              <Button variant="ghost" size="sm" className="mt-3 w-full">
                Gérer les AO
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                <Mic className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{meetingsCount}</p>
            <p className="text-sm text-slate-500 mt-1">Réunions enregistrées</p>
            <Link to="/assistant-reunion">
              <Button variant="ghost" size="sm" className="mt-3 w-full">
                Nouvelle réunion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Appels d'offres récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">
                  Aucun appel d'offres pour le moment
                </p>
                <Link to="/appel-offres">
                  <Button size="sm">
                    Créer un appel d'offres
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100">
                  <Link to="/appel-offres">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir tous les appels d'offres
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Réunions récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">
                  Aucune réunion enregistrée
                </p>
                <Link to="/assistant-reunion">
                  <Button size="sm">
                    Enregistrer une réunion
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Mic className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {meeting.title || 'Réunion sans titre'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(meeting.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {meeting.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100">
                  <Link to="/assistant-reunion">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir toutes les réunions
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accès rapides</CardTitle>
            <CardDescription>
              Lancez rapidement vos principales fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to="/appel-offres"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Appels d'offres</p>
                    <p className="text-xs text-slate-500">Créer et gérer vos AO</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>

              <Link
                to="/assistant-reunion"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mic className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Assistant réunion</p>
                    <p className="text-xs text-slate-500">Enregistrer et synthétiser</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Détails de votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-600">Nom</dt>
                <dd className="font-medium text-slate-900">
                  {profile?.full_name || 'Non renseigné'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-600">Email</dt>
                <dd className="font-medium text-slate-900 truncate max-w-[200px]">{user?.email}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">Statut</dt>
                <dd className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Actif
                </dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/settings">
                <Button variant="outline" size="sm" className="w-full">
                  Gérer mon compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
