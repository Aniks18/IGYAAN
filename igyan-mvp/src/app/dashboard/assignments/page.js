'use client';

import { useState } from 'react';
import { aiChat } from "@/app/utils/ai-fallback";
import { FileText, Download, BookOpen, Sparkles, CheckCircle, Loader2, Copy, Check } from 'lucide-react';
import { cbseData, getSubjects, getTopics } from './data/cbseData';
import { generateMCQPDF } from './utils/mcqPDFGenerator';
import OpenAI from 'openai/index.js';

export default function DashboardAssignmentsPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionOrder, setQuestionOrder] = useState('mixed');
  const [questionTypes, setQuestionTypes] = useState({});
  const [generatedMCQs, setGeneratedMCQs] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const subjects = selectedClass ? getSubjects(selectedClass) : [];
  const topics = selectedClass && selectedSubject ? getTopics(selectedSubject, selectedClass) : [];

  // Initialize question types when question count changes
  const handleQuestionCountChange = (count) => {
    setQuestionCount(count);
    const types = {};
    for (let i = 1; i <= parseInt(count); i++) {
      types[i] = questionTypes[i] || 'mcq';
    }
    setQuestionTypes(types);
  };

  const handleQuestionTypeChange = (questionNumber, type) => {
    setQuestionTypes(prev => ({
      ...prev,
      [questionNumber]: type
    }));
  };

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleGenerateMCQs = async () => {
    if (!selectedClass || !selectedSubject || !selectedTopic) return;
    
    setIsGenerating(true);
    setGeneratedMCQs('');
    setShowPreview(false);

    try {
      const classInfo = cbseData.classes.find(c => c.id === selectedClass)?.name || selectedClass;
      
      const difficultyText = {
        easy: 'Easy - Basic recall and understanding',
        medium: 'Medium - Application and analysis',
        hard: 'Hard - Complex reasoning and evaluation'
      }[difficulty];

      const orderText = {
        mixed: 'Mix of conceptual, application, and analytical questions',
        conceptual: 'Focus on conceptual understanding and definitions',
        application: 'Focus on practical application and problem-solving',
        analytical: 'Focus on analysis, evaluation, and higher-order thinking'
      }[questionOrder];

      // Build question type instructions
      let questionTypeInstructions = '\n\nQuestion Format Requirements:\n';
      Object.entries(questionTypes).forEach(([num, type]) => {
        const typeFormat = {
          mcq: 'Multiple Choice Question with 4 options (A, B, C, D) and correct answer',
          'short-answer': 'Short Answer Question (2-3 sentences expected)',
          'long-answer': 'Long Answer Question (detailed explanation expected, 5-7 sentences)',
          'hot-question': 'Higher Order Thinking Question (application/analysis/evaluation level with detailed explanation)'
        }[type];
        questionTypeInstructions += `Q${num}: ${typeFormat}\n`;
      });

      const systemPrompt = `You are an expert CBSE curriculum assessment creator. Generate exactly ${questionCount} high-quality questions for ${classInfo} ${selectedSubject} on the topic "${selectedTopic}".

Difficulty Level: ${difficultyText}
Question Type: ${orderText}
${questionTypeInstructions}

Format your response EXACTLY based on question type:

For MCQ:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

For Short Answer:
Q2: [Question text]
Expected Answer: [2-3 sentence answer]
Marking Scheme: [Key points for evaluation]

For Long Answer:
Q3: [Question text]
Expected Answer: [Detailed 5-7 sentence answer]
Marking Scheme: [Key points with marks distribution]

For HOT Question:
Q4: [Higher order thinking question]
Expected Answer: [Detailed analytical/evaluative answer]
Marking Scheme: [Points for analysis, application, evaluation]

IMPORTANT:
- Generate EXACTLY ${questionCount} questions
- Follow CBSE curriculum standards strictly
- Ensure clarity and no ambiguity
- Match the specified difficulty level
- Follow the exact format for each question type`;

      const response = await aiChat({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Create ${questionCount} ${difficulty} difficulty questions on ${selectedTopic} for ${classInfo} ${selectedSubject}. Follow the specified format for each question type.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const questionContent = response.choices[0].message.content;
      setGeneratedMCQs(questionContent);
      setShowPreview(true);

    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please check your API key and try again.');
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedMCQs) return;
    
    try {
      const classInfo = cbseData.classes.find(c => c.id === selectedClass)?.name || selectedClass;
      const doc = generateMCQPDF(generatedMCQs, classInfo, selectedSubject, selectedTopic);
      doc.save(`Questions_${selectedClass}_${selectedSubject}_${selectedTopic.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCopyText = async () => {
    if (!generatedMCQs) return;
    
    try {
      await navigator.clipboard.writeText(generatedMCQs);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
      alert('Failed to copy text. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTopic('');
    setQuestionCount('5');
    setDifficulty('medium');
    setQuestionOrder('mixed');
    setQuestionTypes({});
    setGeneratedMCQs('');
    setShowPreview(false);
    setIsCopied(false);
  };

  return (
    <div className="min-h-full space-y-8 p-6 lg:p-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 text-white shadow-lg">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              AI Questions Generator
            </h1>
            <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Create professional MCQ assessments for CBSE curriculum using AI. Select class, subject, and topic to get started.
            </p>
          </div>
        </div>
      </header>

      {/* Configuration Section */}
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedClass ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
              {selectedClass ? <CheckCircle size={16} /> : '1'}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Class</span>
          </div>
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedSubject ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
              {selectedSubject ? <CheckCircle size={16} /> : '2'}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject</span>
          </div>
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedTopic ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
              {selectedTopic ? <CheckCircle size={16} /> : '3'}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Topic</span>
          </div>
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${questionCount ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
              {questionCount ? <CheckCircle size={16} /> : '4'}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Configure</span>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Class Selection */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-indigo-500" size={20} />
              <h3 className="font-semibold text-zinc-900 dark:text-white">Select Class</h3>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
                setSelectedTopic('');
              }}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Choose class...</option>
              {cbseData.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-purple-500" size={20} />
              <h3 className="font-semibold text-zinc-900 dark:text-white">Select Subject</h3>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('');
              }}
              disabled={!selectedClass}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Choose subject...</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selection */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-pink-500" size={20} />
              <h3 className="font-semibold text-zinc-900 dark:text-white">Select Topic</h3>
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Choose topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration Options */}
        {selectedTopic && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Question Count */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-emerald-500" size={20} />
              <h3 className="font-semibold text-zinc-900 dark:text-white">Number of Questions</h3>
            </div>
            <select
              value={questionCount}
              onChange={(e) => handleQuestionCountChange(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Question{i + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>            {/* Difficulty Level */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Difficulty Level</h3>
              </div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className="text-blue-500" size={20} />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Question Type</h3>
              </div>
              <select
                value={questionOrder}
                onChange={(e) => setQuestionOrder(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="mixed">Mixed (Balanced)</option>
                <option value="conceptual">Conceptual</option>
                <option value="application">Application-Based</option>
                <option value="analytical">Analytical</option>
              </select>
            </div>
          </div>
        )}

        {/* Individual Question Type Selection */}
        {selectedTopic && questionCount && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Configure Each Question Type
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(parseInt(questionCount))].map((_, i) => {
                const questionNum = i + 1;
                return (
                  <div key={questionNum} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Question {questionNum}
                    </label>
                    <select
                      value={questionTypes[questionNum] || 'mcq'}
                      onChange={(e) => handleQuestionTypeChange(questionNum, e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="mcq">MCQ</option>
                      <option value="short-answer">Short Answer</option>
                      <option value="long-answer">Long Answer</option>
                      <option value="hot-question">HOT Question</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedClass && selectedSubject && selectedTopic && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleGenerateMCQs}
              disabled={isGenerating}
              className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generate Questions
                </>
              )}
            </button>
            
            {isGenerating && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 dark:border-indigo-900 dark:bg-indigo-900/20">
                <p className="text-sm text-indigo-900 dark:text-indigo-100">
                  Creating {questionCount} {difficulty} questions... This may take a moment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Preview Section */}
        {showPreview && generatedMCQs && (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Generated Questions Preview
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-blue-400/40"
                  >
                    {isCopied ? (
                      <>
                        <Check size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy Text
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-xl border-2 border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
                  >
                    Start New
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {generatedMCQs}
                </pre>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  ✓ Questions Generated Successfully!
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Review the questions above and click "Download PDF" when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div 
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface-solid)',
            }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: 'var(--dashboard-primary)' }}
            >
              AI-Powered
            </p>
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--dashboard-text)' }}
            >
              Questions generated using advanced AI following CBSE curriculum
            </p>
          </div>
          <div 
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface-solid)',
            }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: 'var(--dashboard-primary)' }}
            >
              Instant PDF
            </p>
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--dashboard-text)' }}
            >
              Download professional PDFs with answer keys automatically
            </p>
          </div>
          <div 
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface-solid)',
            }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: 'var(--dashboard-primary)' }}
            >
              Fully Customizable
            </p>
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--dashboard-text)' }}
            >
              Choose count, difficulty, and question types for perfect assessments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
