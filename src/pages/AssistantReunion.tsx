import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, Users, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: number;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export function AssistantReunion() {
  const [meetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Réunion de planification projet',
      date: '2026-03-05',
      time: '14:00',
      participants: 5,
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Point hebdomadaire équipe',
      date: '2026-03-03',
      time: '10:00',
      participants: 8,
      status: 'completed'
    }
  ]);

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Planifiée';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
    }
  };

  return (
    <AppLayout
      title="Assistant réunion"
      description="Gérez vos réunions et comptes-rendus"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réunion
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {meetings.filter(m => m.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-slate-600">Réunions à venir</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {meetings.filter(m => m.status === 'in-progress').length}
                  </p>
                  <p className="text-sm text-slate-600">En cours</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {meetings.filter(m => m.status === 'completed').length}
                  </p>
                  <p className="text-sm text-slate-600">Comptes-rendus</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Réunions récentes</h2>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{meeting.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(meeting.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.participants} participants
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusText(meeting.status)}
                    </span>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
