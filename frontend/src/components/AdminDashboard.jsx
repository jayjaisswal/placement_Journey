import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// Admin token: set VITE_ADMIN_TOKEN in frontend/.env, or the admin enters it in Settings
const getAdminToken = () =>
  import.meta.env.VITE_ADMIN_TOKEN ||
  sessionStorage.getItem('adminToken') ||
  'admin123'
const CATEGORIES = ['OS', 'DBMS', 'CN', 'DSA', 'OOP', 'System Design', 'Aptitude', 'Other']

const NAV_ITEMS = [
  { id: 'add', label: 'Add Lecture', icon: '➕' },
  { id: 'articles', label: 'Manage Articles', icon: '📋' },
  { id: 'quiz', label: 'Quiz Questions', icon: '🧠' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const EMPTY_FORM = {
  title: '',
  category: 'DSA',
  subCategory: '',
  lectureLink: '',
  pdfLink: '',
  body: '',
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  )
}

// ── Add Lecture Panel ──────────────────────────────────────────
function AddLecturePanel({ showToast }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.post('/api/articles', form, {
        headers: { 'x-admin-token': getAdminToken() },
      })
      showToast('Lecture added successfully!', 'success')
      setForm(EMPTY_FORM)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add lecture', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Lecture</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Process Management — OS"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Category</label>
            <input
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              placeholder="e.g. Process Scheduling"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lecture Video URL (YouTube)</label>
          <input
            name="lectureLink"
            value={form.lectureLink}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">PDF Link</label>
          <input
            name="pdfLink"
            value={form.pdfLink}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Body / Content *{' '}
            <span className="text-slate-400 font-normal">(HTML supported)</span>
          </label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            required
            rows={6}
            placeholder="<h2>Introduction</h2><p>A process is...</p>"
            className={`${inputCls} resize-y font-mono`}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          {saving ? 'Saving…' : '➕ Add Lecture'}
        </button>
      </form>
    </div>
  )
}

// ── Manage Articles Panel ──────────────────────────────────────
function ManageArticlesPanel({ showToast }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/articles')
      setArticles(data)
    } catch {
      showToast('Failed to load articles', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return
    try {
      await axios.delete(`/api/articles/${id}`, {
        headers: { 'x-admin-token': getAdminToken() },
      })
      showToast('Article deleted', 'success')
      setArticles((prev) => prev.filter((a) => a._id !== id))
    } catch {
      showToast('Failed to delete article', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Articles</h2>
        <button
          onClick={fetchArticles}
          className="text-sm text-indigo-600 hover:underline"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p>No articles yet. Add some from the "Add Lecture" panel.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.title}</td>
                  <td className="px-5 py-3">
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                      {a.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Quiz Questions Panel ───────────────────────────────────────
function QuizPanel({ showToast }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/quiz?limit=50')
      setQuestions(data)
    } catch {
      showToast('Failed to load questions', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const { data } = await axios.post('/api/quiz/seed', {}, {
        headers: { 'x-admin-token': getAdminToken() },
      })
      showToast(data.message, 'success')
      fetchQuestions()
    } catch (err) {
      showToast(err.response?.data?.message || 'Seeding failed', 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Quiz Questions</h2>
        <div className="flex gap-3">
          <button onClick={fetchQuestions} className="text-sm text-indigo-600 hover:underline">
            🔄 Refresh
          </button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {seeding ? 'Seeding…' : '🌱 Seed Sample Questions'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-3">🤔</div>
          <p>No questions yet. Click "Seed Sample Questions" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="font-medium text-slate-800 mb-2">
                <span className="text-slate-400 text-sm mr-2">#{i + 1}</span>
                {q.question}
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {q.options.map((opt, oi) => (
                  <span
                    key={oi}
                    className={`px-3 py-1 rounded-lg border text-xs ${
                      oi === q.correctIndex
                        ? 'bg-green-50 border-green-300 text-green-700 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {oi === q.correctIndex ? '✅ ' : ''}{opt}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {q.company}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {q.category}
                </span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {q.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Settings Panel ─────────────────────────────────────────────
function SettingsPanel() {
  const [tokenInput, setTokenInput] = useState(sessionStorage.getItem('adminToken') || '')
  const [saved, setSaved] = useState(false)

  const saveToken = () => {
    if (tokenInput.trim()) {
      sessionStorage.setItem('adminToken', tokenInput.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
      <div className="max-w-lg space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Admin Token</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Enter your admin token below. It is stored in <code className="bg-yellow-100 px-1 rounded">sessionStorage</code> and
            never committed to source code. Alternatively, set{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_ADMIN_TOKEN</code> in{' '}
            <code className="bg-yellow-100 px-1 rounded">frontend/.env</code>.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter admin token"
              className="flex-1 border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={saveToken}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saved ? '✅ Saved' : 'Save'}
            </button>
          </div>
          <p className="text-yellow-600 text-xs mt-2">
            Backend token is set via <code className="bg-yellow-100 px-1 rounded">ADMIN_TOKEN</code> in{' '}
            <code className="bg-yellow-100 px-1 rounded">backend/.env</code>.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
          <h3 className="font-semibold text-slate-700 mb-2">📡 Backend API</h3>
          <p>
            All API requests are proxied to <code className="bg-slate-100 px-1 rounded">http://localhost:5000</code>{' '}
            via Vite's dev-server proxy.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-700">
          <h3 className="font-semibold text-blue-800 mb-2">🗄️ Database</h3>
          <p>
            Set <code className="bg-blue-100 px-1 rounded">MONGODB_URI</code> in{' '}
            <code className="bg-blue-100 px-1 rounded">backend/.env</code> to point to your MongoDB
            instance. The default database is{' '}
            <code className="bg-blue-100 px-1 rounded">placement_journey</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Admin Dashboard ───────────────────────────────────────
export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState('add')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
  }, [])

  const renderPanel = () => {
    switch (activePanel) {
      case 'add': return <AddLecturePanel showToast={showToast} />
      case 'articles': return <ManageArticlesPanel showToast={showToast} />
      case 'quiz': return <QuizPanel showToast={showToast} />
      case 'settings': return <SettingsPanel />
      default: return null
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-lg font-bold">🛠️ Admin Panel</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your content</p>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePanel === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {renderPanel()}
      </main>
    </div>
  )
}
