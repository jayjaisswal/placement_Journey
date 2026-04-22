import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const features = [
  {
    icon: '📚',
    title: 'GFG-Style Articles',
    desc: 'Browse categorised study material for OS, DBMS, CN, DSA and more with embedded lecture links and PDF notes.',
  },
  {
    icon: '🧠',
    title: 'TCS / Wipro Quiz',
    desc: 'Timed MCQ engine with per-question navigation, auto-advance on timeout, and a detailed score report at the end.',
  },
  {
    icon: '🗂️',
    title: 'Topic Sidebar',
    desc: 'Collapsible nested folder structure to browse topics, lecture videos, and PDF notes at a glance.',
  },
  {
    icon: '🛠️',
    title: 'Admin Dashboard',
    desc: 'Add lectures, manage articles, seed quiz questions, and control the entire site from one place.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Ace Your <span className="text-indigo-400">Placement Journey</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            One platform for structured notes, timed quizzes, and curated lecture links — everything
            you need to crack TCS, Wipro, Infosys and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/quiz"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Start Quiz 🧠
            </Link>
            <Link
              to="/admin"
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Admin Panel 🛠️
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-indigo-600 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '8+', label: 'Subjects' },
            { value: '50+', label: 'Topics' },
            { value: '100+', label: 'MCQs' },
            { value: '5', label: 'Companies' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-indigo-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sidebar demo */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Browse Topics
        </h2>
        <p className="text-center text-slate-500 mb-8">
          Click any category below to explore sub-topics and access lecture videos & PDF notes.
        </p>
        <div className="max-w-sm mx-auto">
          <Sidebar />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm">
        <p>PlacementJourney — Built for aspiring engineers 🚀</p>
      </footer>
    </div>
  )
}
