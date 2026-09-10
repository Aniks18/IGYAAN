'use client';

import { useState } from 'react';
import { aiChat } from "@/app/utils/ai-fallback";
import { Send, Loader2, FileQuestion, CheckCircle } from 'lucide-react';
import OpenAI from 'openai/index.js';

export default function QuestionPaperChatbot({
  mode,
  selectedClass,
  selectedSubject,
  selectedTopic,
  oldContent,
  customPrompt,
  examDuration,
  totalMarks,
  onGenerate,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: mode === 'new'
        ? `Hello! I'm your Question Paper Generator AI. I'll help you create a comprehensive ${examDuration}-hour ${totalMarks}-marks question paper for ${selectedClass} ${selectedSubject}.\n\nTell me:\n• Number of questions needed\n• Section breakdown (VSA, SA, LA, etc.)\n• Specific topics to focus on\n• Any special instructions\n\nExample: "Create a question paper with Section A: 10 VSA (1 mark each), Section B: 8 SA (3 marks each), Section C: 5 LA (5 marks each)"`
        : `Hello! I'll generate a question paper based on your old content and instructions.\n\nYour instructions:\n"${customPrompt}"\n\nI'll analyze the old question paper pattern and create a new one following your requirements. Just click "Generate" or provide additional instructions.`,
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
      let systemPrompt = '';
      let userPrompt = '';

      if (mode === 'new') {
        systemPrompt = `You are an expert CBSE question paper creator. Generate a comprehensive question paper for ${selectedClass} ${selectedSubject} on the topic "${selectedTopic}".

EXAM DETAILS:
- Duration: ${examDuration} hours
- Total Marks: ${totalMarks}
- Board: CBSE

FORMAT YOUR RESPONSE EXACTLY AS:

[QUESTION PAPER HEADER]
Class: ${selectedClass}
Subject: ${selectedSubject}
Time: ${examDuration} Hours
Maximum Marks: ${totalMarks}

GENERAL INSTRUCTIONS:
1. All questions are compulsory
2. Read questions carefully before answering
3. Marks are indicated against each question
4. Use diagrams wherever necessary

---

SECTION A: [Section Name] (X Marks)
[Instructions for this section]

Q1. [Question text] (X marks)
Q2. [Question text] (X marks)
...

SECTION B: [Section Name] (Y Marks)
[Instructions for this section]

Q10. [Question text] (Y marks)
...

---

MARKING SCHEME:
Q1. [Answer with marking points] (X marks)
Q2. [Answer with marking points] (X marks)
...

IMPORTANT:
- Follow CBSE pattern strictly
- Include variety: MCQs, VSA, SA, LA, Case-based
- Ensure questions test different cognitive levels
- Provide detailed marking scheme`;

        userPrompt = currentQuestion;
      } else {
        systemPrompt = `You are an expert CBSE question paper creator. The user has provided an old question paper and wants you to create a new one based on their instructions.

OLD QUESTION PAPER:
${oldContent}

USER INSTRUCTIONS:
${customPrompt}

Generate a complete new question paper following the user's instructions and maintaining the quality and format of CBSE standards.

FORMAT YOUR RESPONSE EXACTLY AS:

[QUESTION PAPER HEADER]
Class: [Appropriate Class]
Subject: [Appropriate Subject]
Time: [Duration] Hours
Maximum Marks: [Total Marks]

GENERAL INSTRUCTIONS:
[List of instructions]

---

SECTION A: [Section Name]
Q1. [Question] (marks)
...

SECTION B: [Section Name]
Q10. [Question] (marks)
...

---

MARKING SCHEME:
Q1. [Detailed answer with marking points]
...`;

        userPrompt = currentQuestion || 'Generate the question paper as per the instructions';
      }

      const response = await aiChat({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const aiResponse = response.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          isGeneratedPaper: true,
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
    <div className="flex h-[700px] flex-col rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 dark:border-zinc-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
        <div className="rounded-xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 p-2.5 text-white shadow-lg">
          <FileQuestion size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">Question Paper Generator AI</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {mode === 'new'
              ? `${selectedClass} • ${selectedSubject} • ${examDuration}h / ${totalMarks}M`
              : 'Generating from old question paper data'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              {message.isGeneratedPaper && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/20 p-2.5 text-xs font-semibold dark:bg-black/20">
                  <CheckCircle size={16} />
                  Question Paper Generated! Click "Download PDF" to save.
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Generating question paper...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              mode === 'new'
                ? "e.g., Create with Section A: 10 MCQs (1m), Section B: 5 SA (3m), Section C: 3 LA (5m)"
                : "Any additional instructions or modifications needed..."
            }
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-500/30"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
