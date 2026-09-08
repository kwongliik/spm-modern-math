'use client';

import { useState } from 'react';
import InlineMath from 'react-katex';
import { spmModernMathSyllabus } from '@/lib/syllabus';

export default function Home() {
  const [form, setForm] = useState('Form4');
  const [topic, setTopic] = useState(spmModernMathSyllabus.Form4[0]);
  const [paperType, setPaperType] = useState('Paper 1');
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [loading, setLoading] = useState(false);
  const [questionData, setQuestionData] = useState(null);

  const handleFormChange = (e) => {
    const selectedForm = e.target.value;
    setForm(selectedForm);
    setTopic(spmModernMathSyllabus[selectedForm][0]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setQuestionData(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, topic, paperType, difficulty })
      });
      const data = await res.json();
      setQuestionData(data);
    } catch (err) {
      alert("Failed to fetch exercise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 my-10">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          🇲🇾 SPM Modern Mathematics Exercise Generator
        </h1>

        {/* Controls Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Form Level</label>
            <select value={form} onChange={handleFormChange} className="w-full p-2 border rounded-md">
              <option value="Form4">Form 4</option>
              <option value="Form5">Form 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paper Type</label>
            <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="Paper 1">Paper 1 (MCQ)</option>
              <option value="Paper 2">Paper 2 (Structured)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Topic</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-2 border rounded-md">
              {spmModernMathSyllabus[form].map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Difficulty Level</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium (Exam Standard)</option>
              <option value="Hard (HOTS/KBAT)">Hard (HOTS / KBAT)</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Generating Question...' : 'Generate New Question'}
        </button>
      </div>

      {/* Output Display */}
      {questionData && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded">
            {questionData.type}
          </span>
          
          <div className="my-4 text-lg text-slate-800 leading-relaxed">
            <InlineMath math={questionData.questionText} />
          </div>

          {/* Paper 1 Options */}
          {questionData.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
              {questionData.options.map((option, idx) => (
                <div key={idx} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <InlineMath math={option} />
                </div>
              ))}
            </div>
          )}

          {/* Solution & Explanation Dropdown */}
          <details className="mt-6 border-t pt-4">
            <summary className="cursor-pointer text-blue-600 font-medium">View Solution & Marking Scheme</summary>
            <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2">
              <p><strong>Correct Answer:</strong> <InlineMath math={questionData.correctAnswer} /></p>
              
              {questionData.markingScheme && (
                <div>
                  <strong>Marking Scheme:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {questionData.markingScheme.map((step, i) => (
                      <li key={i}><InlineMath math={step} /></li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="pt-2"><strong>Explanation:</strong> {questionData.explanation}</p>
            </div>
          </details>
        </div>
      )}
    </main>
  );
}