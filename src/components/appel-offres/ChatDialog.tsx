import { Send, Download, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatDialogProps {
  hasMemo: boolean;
}

export function ChatDialog({ hasMemo }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    setTimeout(() => {
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: generateResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('délai') || lowerQuestion.includes('planning')) {
      return 'Concernant les délais, notre planning prévoit une phase préparatoire de 2 semaines, suivie de 10 mois d\'exécution et 2 semaines de finition. Nous avons prévu des marges de sécurité pour absorber les aléas. Souhaitez-vous que je détaille une phase particulière ?';
    }

    if (lowerQuestion.includes('équipe') || lowerQuestion.includes('personnel')) {
      return 'Notre équipe sera composée de 15 compagnons qualifiés, 3 chefs de chantier expérimentés et 1 conducteur de travaux dédié. Tous disposent des certifications requises. Voulez-vous plus de détails sur les qualifications ?';
    }

    if (lowerQuestion.includes('matériel') || lowerQuestion.includes('équipement')) {
      return 'Nous disposons d\'un parc matériel moderne et régulièrement entretenu, incluant tout l\'équipement nécessaire pour ce type de chantier. Le matériel de sécurité est conforme aux dernières normes. Souhaitez-vous la liste détaillée ?';
    }

    if (lowerQuestion.includes('référence') || lowerQuestion.includes('expérience')) {
      return 'Nous avons réalisé plus de 50 chantiers similaires ces 5 dernières années avec un taux de satisfaction client de 98%. Je peux vous fournir des références spécifiques si nécessaire. Quel type de projet vous intéresse particulièrement ?';
    }

    return 'Je suis là pour vous aider à affiner le mémoire technique. Vous pouvez me poser des questions sur les délais, l\'équipe, le matériel, la méthodologie, ou tout autre aspect du projet. Comment puis-je vous aider ?';
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
      )}
    </div>
  );
}
