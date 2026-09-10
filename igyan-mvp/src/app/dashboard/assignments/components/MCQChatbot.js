'use client';

import { useState } from 'react';
import { aiChat } from "@/app/utils/ai-fallback";
import { Send, Loader2, BookOpen, FileText } from 'lucide-react';
import OpenAI from 'openai/index.js';

export default function MCQChatbot({ selectedClass, selectedSubject, selectedTopic, onGenerate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your MCQ Assessment Generator. I can help you create high-quality multiple-choice questions for ${selectedClass} ${selectedSubject}.\n\nJust tell me:\n• Number of questions you need\n• Difficulty level (Easy/Medium/Hard)\n• Any specific focus areas\n\nExample: "Create 10 medium difficulty MCQs on ${selectedTopic}"`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are an expert CBSE curriculum assessment creator. Generate high-quality multiple-choice questions for ${selectedClass} ${selectedSubject} on the topic "${selectedTopic}".

Format your response EXACTLY as follows:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

Q2: [Next question...]

IMPORTANT:
- Follow CBSE curriculum standards
- Include variety: conceptual, application, and analytical questions
- Ensure clarity and no ambiguity
- Provide detailed explanations
- Match difficulty level requested`;

      const response = await aiChat({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: currentQuestion,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      });

      const aiResponse = response.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          isGeneratedMCQ: true,
        },
      ]);

      // Enable generate PDF button
      onGenerate(aiResponse);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Sorry, there was an error: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-linear-to-r from-indigo-50 to-purple-50 p-4 dark:border-zinc-800 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 p-2 text-white">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">MCQ Generator AI</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {selectedClass} • {selectedSubject} • {selectedTopic}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              {message.isGeneratedMCQ && (
                <div className="mt-3 rounded-xl bg-white/20 p-2 text-xs font-semibold dark:bg-black/20">
                  ✓ MCQs generated! Click "Generate PDF" below to download.
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Generating MCQs...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g., Create 15 hard MCQs on Photosynthesis..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-500/30"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
