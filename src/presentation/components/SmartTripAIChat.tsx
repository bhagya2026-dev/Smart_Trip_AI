import React, { useState } from 'react';
import { Bot, Code2, CornerDownLeft, Sparkles, User, X } from 'lucide-react';
import type { AIQueryResponse } from '../../domain/models/telemetry';
import { aiAssistant } from '../../services/aiAssistant';

export const SmartTripAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: 'USER' | 'AI'; text: string; responseData?: AIQueryResponse }>
  >([
    {
      sender: 'AI',
      text: 'Hello! I am your SmartTrip AI assistant. Ask me anything about your trip telemetry, fuel friction waste, safety scores, or pit stops.',
    },
  ]);
  const [showSQLId, setShowSQLId] = useState<number | null>(null);

  const quickPrompts = [
    'How much money did I waste in traffic this week?',
    'What was my lowest eco score?',
    'Show all pit stops',
    'How many hard brakes did I have?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    // Append user message
    const userMsg = { sender: 'USER' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await aiAssistant.query(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: res.answerSummary,
          responseData: res,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Sorry, I encountered an error translating your query into SQL. Please try another question.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-telemetry-blue to-eco hover:scale-105 text-white font-bold px-4 py-3 rounded-full shadow-hud-blue transition-all"
        >
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono">SMART TRIP AI CHAT</span>
        </button>
      )}

      {/* Floating Glassmorphic Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[420px] h-[540px] z-50 glass-panel border border-telemetry-blue/40 rounded-2xl shadow-glass flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-3 bg-cyber-surface/90 border-b border-cyber-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-telemetry-blue/20 text-telemetry-cyan">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono text-white">SMART TRIP AI ASSISTANT</h3>
                <p className="text-[10px] text-eco-light font-mono">ON-DEVICE SQL QUERY ENGINE</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-cyber-muted hover:text-white rounded-lg hover:bg-cyber-panel transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[88%] leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-telemetry-blue/20 text-white border border-telemetry-blue/40'
                      : 'bg-cyber-panel text-cyber-text border border-cyber-border'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-cyber-muted">
                    {msg.sender === 'USER' ? (
                      <>
                        <User className="w-3 h-3 text-telemetry-blue" />
                        <span>YOU</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-eco-light" />
                        <span>AI TELEMATICS ENGINE</span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Generated SQL Collapsible Inspector */}
                  {msg.responseData?.generatedSQL && (
                    <div className="mt-2.5 pt-2 border-t border-cyber-border/60">
                      <button
                        onClick={() => setShowSQLId(showSQLId === idx ? null : idx)}
                        className="flex items-center space-x-1 text-[10px] text-telemetry-cyan hover:underline font-bold"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{showSQLId === idx ? 'HIDE EXECUTED SQL' : 'VIEW GENERATED SQL'}</span>
                      </button>

                      {showSQLId === idx && (
                        <pre className="mt-1.5 p-2 rounded bg-cyber-bg text-[10px] text-telemetry-amber overflow-x-auto border border-cyber-border">
                          {msg.responseData.generatedSQL}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-cyber-muted text-xs font-mono p-2">
                <Sparkles className="w-4 h-4 text-telemetry-cyan animate-spin" />
                <span>Translating natural query into SQLite execution...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-cyber-panel/50 border-t border-cyber-border overflow-x-auto flex space-x-2 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-cyber-surface hover:bg-cyber-border text-[10px] text-cyber-text border border-cyber-border transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-cyber-surface border-t border-cyber-border flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask trip AI (e.g. 'Show fuel cost wasted')..."
              className="flex-1 bg-cyber-bg text-white text-xs px-3 py-2 rounded-xl border border-cyber-border focus:outline-none focus:border-telemetry-blue"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-telemetry-blue hover:bg-blue-600 text-white disabled:opacity-40 transition-all"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
