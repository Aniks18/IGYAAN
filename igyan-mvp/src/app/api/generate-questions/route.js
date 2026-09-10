import { NextResponse } from 'next/server';
import { aiFetch } from "@/app/utils/ai-fallback";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export async function POST(request) {
  try {
    const { topic, numQuestions, questionType, subject, prompt, classLevel, difficulty, language, bloomsLevel } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Handle direct prompt for question paper generation
    if (prompt) {
      const response = await aiFetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert educator specializing in creating professional CBSE question papers. Generate well-formatted question papers with proper sections, instructions, and marking schemes.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.error?.message || 'OpenAI API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      return NextResponse.json({ content });
    }

    let systemPrompt = '';
    let userPrompt = '';

    const classLabel = classLevel ? `Class ${classLevel}` : 'general level';
    const difficultyLabel = difficulty || 'medium';
    const langLabel = language || 'English';
    const bloomsLabel = bloomsLevel || 'understanding';

    if (questionType === 'mcq') {
      systemPrompt = `You are an expert educator specializing in creating high-quality multiple-choice questions for ${classLabel} students. Tailor the complexity, vocabulary, and depth of questions to be appropriate for ${classLabel} students. Create questions that test deep understanding, not just memorization. Each question should be clear, unambiguous, and have exactly 4 options with only one correct answer. Generate all questions in ${langLabel}.`;
      
      userPrompt = `Create ${numQuestions} multiple-choice questions with the following specifications:

📚 Subject: ${subject}
📖 Topic: "${topic}"
🎓 Class/Grade: ${classLabel}
🎯 Difficulty: ${difficultyLabel}
🧠 Cognitive Level (Bloom's Taxonomy): ${bloomsLabel}
🌐 Language: ${langLabel}

STRICT FORMAT REQUIREMENTS:
Return ONLY a valid JSON array with NO markdown, NO code blocks, NO explanations. Just raw JSON.

Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "marks": 1
  }
]

Rules:
- correct_answer is the index (0-3) of the correct option
- ALL questions must be at ${difficultyLabel} difficulty level appropriate for ${classLabel}
- Questions must target the "${bloomsLabel}" level of Bloom's Taxonomy
- Ensure options are plausible but only one is correct
- Use age-appropriate language and concepts for ${classLabel}
- Generate questions in ${langLabel}
- Each question worth 1 mark`;
    } else {
      systemPrompt = `You are an expert educator specializing in creating thoughtful viva (oral examination) questions for ${classLabel} students. Create open-ended questions that encourage critical thinking, application of knowledge, and verbal expression. Tailor the complexity to ${classLabel} level. Include suggested comprehensive answers. Generate all questions in ${langLabel}.`;
      
      userPrompt = `Create ${numQuestions} viva (oral examination) questions with the following specifications:

📚 Subject: ${subject}
📖 Topic: "${topic}"
🎓 Class/Grade: ${classLabel}
🎯 Difficulty: ${difficultyLabel}
🧠 Cognitive Level (Bloom's Taxonomy): ${bloomsLabel}
🌐 Language: ${langLabel}

STRICT FORMAT REQUIREMENTS:
Return ONLY a valid JSON array with NO markdown, NO code blocks, NO explanations. Just raw JSON.

Format:
[
  {
    "question": "Question text here?",
    "suggested_answer": "Comprehensive answer covering key points...",
    "marks": 5
  }
]

Rules:
- Questions should be open-ended and age-appropriate for ${classLabel}
- Suggested answers should be comprehensive (2-3 sentences minimum)
- Questions must target the "${bloomsLabel}" level of Bloom's Taxonomy
- All questions at ${difficultyLabel} difficulty for ${classLabel}
- Focus on "why" and "how" questions
- Generate questions in ${langLabel}
- Each question worth 5 marks
- Encourage critical thinking and application`;
    }

    const response = await aiFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'OpenAI API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response (remove markdown code blocks if present)
    let questions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questions = JSON.parse(cleanContent);
      
      // Add unique IDs to each question
      questions = questions.map(q => ({
        ...q,
        id: Date.now() + Math.random()
      }));
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
