import React, { useState } from 'react'

const DEFAULT_SIDEBAR_DATA = [
  {
    id: 1,
    name: 'Operating Systems',
    icon: '💻',
    children: [
      {
        id: 11,
        name: 'Process Management',
        children: [
          { id: 111, name: 'Lecture Video', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 112, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
      {
        id: 12,
        name: 'Memory Management',
        children: [
          { id: 121, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 122, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
      {
        id: 13,
        name: 'Deadlocks',
        children: [
          { id: 131, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 132, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'DBMS',
    icon: '🗄️',
    children: [
      {
        id: 21,
        name: 'SQL Basics',
        children: [
          { id: 211, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 212, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
      {
        id: 22,
        name: 'Normalisation',
        children: [
          { id: 221, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 222, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'DSA',
    icon: '🌳',
    children: [
      {
        id: 31,
        name: 'Arrays & Strings',
        children: [
          { id: 311, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 312, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
      {
        id: 32,
        name: 'Trees & Graphs',
        children: [
          { id: 321, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 322, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Computer Networks',
    icon: '🌐',
    children: [
      {
        id: 41,
        name: 'OSI Model',
        children: [
          { id: 411, name: 'Lecture Video', type: 'video', url: '#' },
          { id: 412, name: 'Notes PDF', type: 'pdf', url: '#' },
        ],
      },
    ],
  },
]

function LeafItem({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
    >
      <span>{item.type === 'video' ? '🎥' : '📄'}</span>
      <span>{item.name}</span>
    </a>
  )
}

function SubCategoryItem({ item, openIds, toggle }) {
  const isOpen = openIds.has(item.id)

  return (
    <div>
      <button
        onClick={() => toggle(item.id)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{isOpen ? '📂' : '📁'}</span>
          <span>{item.name}</span>
        </span>
        <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '200px' : '0px' }}
      >
        <div className="pl-5 pt-1 pb-1 space-y-0.5 border-l-2 border-indigo-100 ml-4 mt-1">
          {item.children.map((child) => (
            <LeafItem key={child.id} item={child} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryItem({ item, openIds, toggle }) {
  const isOpen = openIds.has(item.id)

  return (
    <div className="mb-1">
      <button
        onClick={() => toggle(item.id)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-slate-800 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{item.icon}</span>
          <span>{item.name}</span>
        </span>
        <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '600px' : '0px' }}
      >
        <div className="pl-3 mt-1 space-y-0.5 border-l-2 border-indigo-200 ml-5">
          {item.children.map((sub) => (
            <SubCategoryItem key={sub.id} item={sub} openIds={openIds} toggle={toggle} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ data = DEFAULT_SIDEBAR_DATA }) {
  const [openIds, setOpenIds] = useState(new Set())

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
        📂 Study Topics
      </h3>
      {data.map((category) => (
        <CategoryItem key={category.id} item={category} openIds={openIds} toggle={toggle} />
      ))}
    </div>
  )
}
