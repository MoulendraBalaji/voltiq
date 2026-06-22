import React, { useState, useRef, useEffect } from 'react';
import { askCopilot } from '../api';
import type { Message } from '../types';
import {
  Send,
  Sparkles,
  ChevronRight,
  Trash2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface CopilotSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am VoltIQ Copilot, your AI operations assistant. You can ask me questions about EV health, battery anomalies, material supply chain geopolitical risks, and vehicle carbon offsets.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    sessionIdRef.current = 'sess-' + Math.random().toString(36).substring(2, 15);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setError(null);

    const assistantMsgId = 'assistant-' + Date.now();
    const newAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, newAssistantMessage]);

    await askCopilot(userMessage.content, sessionIdRef.current, {
      onChunk: (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      },
      onError: (err: string) => {
        setError(err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + '\n\n*(Error: ' + err + ')*' }
              : msg
          )
        );
      },
      onDone: () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
      },
    });
  };

  const handleClear = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Chat history cleared. How can I help you today?',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setError(null);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-coral shadow-lg shadow-coral/30 hover:bg-coral-active transition-all duration-200 animate-float"
          title="Open VoltIQ Copilot"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-surface-dark-elevated bg-surface-dark backdrop-blur-md transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-surface-dark-elevated p-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral/15">
              <Sparkles className="h-4 w-4 text-coral" />
            </div>
            <h3 className="font-serif text-base font-semibold text-on-dark" style={{ letterSpacing: '-0.2px' }}>VoltIQ Assistant</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleClear}
              disabled={isStreaming}
              className="rounded-lg p-1.5 text-on-dark-soft hover:bg-surface-dark-elevated hover:text-on-dark disabled:opacity-50 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-on-dark-soft hover:bg-surface-dark-elevated hover:text-on-dark transition-colors"
              title="Close panel"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-slideUp`}>
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-coral text-white rounded-tr-none'
                      : 'bg-surface-dark-elevated text-on-dark border border-surface-dark-soft/50 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content || '...'}</p>
                </div>
                <span className="mt-1 text-[9px] text-on-dark-soft px-1">{msg.timestamp}</span>
              </div>
            );
          })}
          {isStreaming && (
            <div className="flex items-center space-x-2 text-[10px] text-on-dark-soft p-1">
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              <span>VoltIQ is querying operational models...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-2 space-y-1.5">
            <p className="text-[10px] font-semibold text-on-dark-soft uppercase tracking-wider">Suggested Queries</p>
            <div className="space-y-1">
              {[
                'Which vehicles are showing battery anomalies?',
                'Are there any geopolitical risks in raw materials?',
                'What is the electrification suitability of mining loaders?',
              ].map((query, i) => (
                <button
                  key={query}
                  onClick={() => setInput(query)}
                  className="w-full text-left rounded-lg bg-surface-dark-elevated/50 hover:bg-surface-dark-elevated border border-surface-dark-soft/30 p-2.5 text-[10px] text-on-dark-soft hover:text-on-dark transition-all duration-200 animate-slideInRight"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-error/10 border border-error/20 p-2.5 text-[10px] text-error flex items-center space-x-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="border-t border-surface-dark-elevated p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask about fleet, supply chain, batteries..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              className="w-full rounded-lg border border-surface-dark-elevated bg-surface-dark-soft px-4 py-2.5 pr-12 text-xs text-on-dark placeholder-on-dark-soft outline-none focus:border-coral transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-coral hover:bg-coral-active text-white transition-colors disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
