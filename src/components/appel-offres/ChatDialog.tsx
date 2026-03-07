import { Send, Download, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, ChatMessage } from '../../lib/chat';
import { getRevisionSystemPrompt } from '../../lib/revisionSystemPrompt';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatDialogProps {
  hasMemo: boolean;
  projectId: string;
  category: string;
  memoContent?: string;
}

export function ChatDialog({ hasMemo, projectId, category, memoContent }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetSection, setTargetSection] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      const { data: documents } = await supabase
        .from('documents')
        .select('content')
        .eq('project_id', projectId);

      const dceDocuments = documents?.map(doc => doc.content).join('\n\n') || '';
      const companyExample = '';

      const systemPrompt = getRevisionSystemPrompt(
        category,
        memoContent || '',
        dceDocuments,
        companyExample,
        targetSection || undefined
      );

      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      chatMessages.push({
        role: 'user',
        content: inputValue
      });

      const response = await sendChatMessage(chatMessages, systemPrompt);

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading conversation as PDF...');
  };

  const handleDownloadWord = () => {
    console.log('Downloading conversation as Word...');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Discussion et révision</h3>
        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadWord}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Word
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!hasMemo && messages.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600">
            Générez d'abord le mémoire technique pour commencer la discussion
          </p>
        </div>
      )}

      {(hasMemo || messages.length > 0) && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                <p className="mb-2">Posez vos questions pour affiner le mémoire technique</p>
                <p className="text-xs">Exemples : détails sur le planning, l'équipe, le matériel...</p>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 border border-slate-200 rounded-lg p-3">
                  <Loader className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  placeholder="Cible (optionnel) : Section 4, Tableau moyens..."
                  disabled={isLoading}
                  className="flex-1 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
