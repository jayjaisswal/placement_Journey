import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const FALLBACK_QUESTIONS = [
  {
    _id: 'f1',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1,
    company: 'TCS',
    category: 'DSA',
  },
  {
    _id: 'f2',
    question: 'Which data structure follows the LIFO (Last In, First Out) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Heap'],
    correctIndex: 1,
    company: 'TCS',
    category: 'DSA',
  },
  {
    _id: 'f3',
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Sequential Query Logic',
      'Standard Question Language',
    ],
    correctIndex: 0,
    company: 'Wipro',
    category: 'DBMS',
  },
  {
    _id: 'f4',
    question: 'Which of the following is NOT a valid process state?',
    options: ['Running', 'Waiting', 'Compiled', 'Ready'],
    correctIndex: 2,
    company: 'TCS',
    category: 'OS',
  },
  {
    _id: 'f5',
    question: 'What is the output of: 2 + "3" in JavaScript?',
    options: ['5', '"23"', '23', 'Error'],
    correctIndex: 2,
    company: 'Wipro',
    category: 'OOP',
  },
]

const TIMER_SECONDS = 30

function ProgressBar({ value, max }) {
  const pct = Math.round((value / max) * 100)
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const loadQuestions = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/quiz?limit=10')
      setQuestions(data.length ? data : FALLBACK_QUESTIONS)
    } catch {
      setQuestions(FALLBACK_QUESTIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const advanceOrSubmit = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setTimeLeft(TIMER_SECONDS)
    } else {
      setSubmitted(true)
    }
  }, [current, questions.length])

  // Timer effect
  useEffect(() => {
    if (loading || submitted || !questions.length) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          advanceOrSubmit()
          return TIMER_SECONDS
        }
        return t - 1
      })
    }, 1000)
    return () => {
      clearInterval(timerRef.current)
    }
  }, [loading, submitted, current, questions.length, advanceOrSubmit])

  const selectOption = (idx) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [current]: idx }))
  }

  const goTo = (idx) => {
    if (submitted) return
    setCurrent(idx)
    setTimeLeft(TIMER_SECONDS)
    clearInterval(timerRef.current)
  }

  const handleSubmit = () => {
    clearInterval(timerRef.current)
    setSubmitted(true)
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrent(0)
    setTimeLeft(TIMER_SECONDS)
    setSubmitted(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⏳</div>
          <p className="text-slate-600 font-medium">Loading questions…</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0)
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
          <div className="text-6xl mb-4">{pct >= 60 ? '🎉' : '📚'}</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-4">
            You scored{' '}
            <span className="font-bold text-indigo-600 text-xl">
              {score}/{questions.length}
            </span>{' '}
            ({pct}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full ${pct >= 60 ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={handleRetry}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-700 mb-4">Detailed Review</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAns = answers[i]
            const isCorrect = userAns === q.correctIndex
            return (
              <div
                key={q._id}
                className={`bg-white rounded-xl shadow-sm border p-5 ${
                  isCorrect ? 'border-green-300' : 'border-red-300'
                }`}
              >
                <p className="font-medium text-slate-800 mb-3">
                  <span className="text-slate-400 mr-2">Q{i + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    let cls = 'px-4 py-2 rounded-lg text-sm border '
                    if (oi === q.correctIndex) cls += 'bg-green-50 border-green-400 text-green-700 font-medium'
                    else if (oi === userAns && !isCorrect) cls += 'bg-red-50 border-red-400 text-red-700'
                    else cls += 'bg-gray-50 border-gray-200 text-gray-600'
                    return (
                      <div key={oi} className={cls}>
                        {oi === q.correctIndex && '✅ '}
                        {oi === userAns && oi !== q.correctIndex && '❌ '}
                        {opt}
                      </div>
                    )
                  })}
                </div>
                {userAns === undefined && (
                  <p className="text-xs text-slate-400 mt-2 italic">Not answered (timed out)</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">
          Question {current + 1} / {questions.length}
        </span>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
          }`}
        >
          ⏱ {timeLeft}s
        </span>
      </div>

      {/* Timer bar */}
      <ProgressBar value={timeLeft} max={TIMER_SECONDS} />

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-5">
        <div className="flex items-start gap-3 mb-6">
          <span className="bg-indigo-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg shrink-0">
            Q{current + 1}
          </span>
          <p className="text-slate-800 text-lg font-medium leading-relaxed">{q.question}</p>
        </div>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const selected = answers[current] === i
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`w-full text-left px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-slate-700'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                i === current
                  ? 'bg-indigo-600 text-white'
                  : answers[i] !== undefined
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button
            onClick={advanceOrSubmit}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
          >
            Submit ✓
          </button>
        )}
      </div>

      {/* Company/Category badge */}
      <div className="flex gap-2 mt-4 justify-center">
        {q.company && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.company}</span>
        )}
        {q.category && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{q.category}</span>
        )}
      </div>
    </div>
  )
}
