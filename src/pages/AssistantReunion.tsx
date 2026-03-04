import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mic, Square, Download, FileText, Loader2, Play, Pause } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AudioRecorder } from '../lib/audioRecorder';
import { useAuth } from '../context/AuthContext';

interface MeetingRecording {
  id: string;
  title: string;
  audio_url: string | null;
  audio_duration: number | null;
  transcript: string | null;
  summary: string | null;
  pdf_url: string | null;
  status: 'recording' | 'processing' | 'completed' | 'error';
  created_at: string;
}

export function AssistantReunion() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<MeetingRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      loadRecordings();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadRecordings = async () => {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecordings(data);
    }
  };

  const startRecording = async () => {
    try {
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;

      await recorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      const { data, error } = await supabase
        .from('meeting_recordings')
        .insert([
          {
            user_id: user?.id,
            title: `Réunion ${new Date().toLocaleDateString('fr-FR')}`,
            status: 'recording',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentRecordingId(data.id);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Erreur lors du démarrage de l\'enregistrement');
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.pauseRecording();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.resumeRecording();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !currentRecordingId) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const audioBlob = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);

      const fileName = `${currentRecordingId}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('meeting-recordings')
        .getPublicUrl(fileName);

      await supabase
        .from('meeting_recordings')
        .update({
          audio_url: urlData.publicUrl,
          audio_duration: recordingTime,
          status: 'processing',
        })
        .eq('id', currentRecordingId);

      setProcessingId(currentRecordingId);
      await processRecording(currentRecordingId, urlData.publicUrl);

      setCurrentRecordingId(null);
      setRecordingTime(0);
      await loadRecordings();
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Erreur lors de l\'arrêt de l\'enregistrement');
    }
  };

  const processRecording = async (recordingId: string, audioUrl: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const transcriptResponse = await fetch(
        `${supabaseUrl}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioUrl, recordingId }),
        }
      );

      if (!transcriptResponse.ok) throw new Error('Transcription failed');

      const { transcript } = await transcriptResponse.json();

      await supabase
        .from('meeting_recordings')
        .update({ transcript })
        .eq('id', recordingId);

      const summaryResponse = await fetch(
        `${supabaseUrl}/functions/v1/generate-meeting-summary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript, recordingId }),
        }
      );

      if (!summaryResponse.ok) throw new Error('Summary generation failed');

      const { summary } = await summaryResponse.json();

      await supabase
        .from('meeting_recordings')
        .update({ summary })
        .eq('id', recordingId);

      const recording = recordings.find((r) => r.id === recordingId);
      const pdfResponse = await fetch(
        `${supabaseUrl}/functions/v1/generate-meeting-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordingId,
            summary,
            title: recording?.title || 'Compte-rendu de réunion',
          }),
        }
      );

      if (!pdfResponse.ok) throw new Error('PDF generation failed');

      const { pdfUrl } = await pdfResponse.json();

      await supabase
        .from('meeting_recordings')
        .update({ pdf_url: pdfUrl, status: 'completed' })
        .eq('id', recordingId);

      setProcessingId(null);
      await loadRecordings();
    } catch (error) {
      console.error('Error processing recording:', error);
      await supabase
        .from('meeting_recordings')
        .update({ status: 'error' })
        .eq('id', recordingId);
      setProcessingId(null);
      await loadRecordings();
    }
  };

  const downloadAudio = async (recording: MeetingRecording) => {
    if (!recording.audio_url) return;

    const response = await fetch(recording.audio_url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (recording: MeetingRecording) => {
    if (!recording.pdf_url) return;

    const response = await fetch(recording.pdf_url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recording':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Enregistrement</span>;
      case 'processing':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Traitement en cours</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Terminé</span>;
      case 'error':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Erreur</span>;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      title="Assistant réunion"
      description="Enregistrez vos réunions et générez automatiquement des comptes-rendus"
    >
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Nouvel enregistrement
            </h2>

            <div className="flex flex-col items-center justify-center py-8">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Démarrer l'enregistrement
                </Button>
              ) : (
                <div className="space-y-6 w-full max-w-md">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4 animate-pulse">
                        <Mic className="w-12 h-12 text-red-600" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-2">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {isPaused ? 'En pause' : 'Enregistrement en cours...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {isPaused ? (
                      <Button onClick={resumeRecording} variant="outline">
                        <Play className="w-5 h-5 mr-2" />
                        Reprendre
                      </Button>
                    ) : (
                      <Button onClick={pauseRecording} variant="outline">
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button
                      onClick={stopRecording}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Arrêter et traiter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Enregistrements récents
            </h2>

            {recordings.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucun enregistrement pour le moment
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900">
                          {recording.title}
                        </h3>
                        {getStatusBadge(recording.status)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(recording.created_at).toLocaleString('fr-FR')}
                        {recording.audio_duration && (
                          <span className="ml-4">
                            Durée: {formatTime(recording.audio_duration)}
                          </span>
                        )}
                      </div>
                      {recording.status === 'processing' &&
                        processingId === recording.id && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Génération du compte-rendu en cours...
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                      {recording.audio_url && recording.status === 'completed' && (
                        <Button
                          onClick={() => downloadAudio(recording)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          MP3
                        </Button>
                      )}
                      {recording.pdf_url && recording.status === 'completed' && (
                        <Button
                          onClick={() => downloadPDF(recording)}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
