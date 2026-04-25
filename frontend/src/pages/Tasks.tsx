import { useState, useEffect } from 'react';
import type { HabitTracker } from '../types';
import axios from 'axios';
import {
  calculateHabitProgress,
  calculateTotalProgress,
} from '../data/tasks';
import { ContributionGraph } from '../components/ContributionGraph';
import { WeeklyTracker } from '../components/WeeklyTracker';
import { ProgressBar } from '../components/ProgressBar';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Target, Plus, Trash2, Edit2 } from 'lucide-react';
import { MonthlyProgress } from './MonthlyProgress';

interface TasksPageProps {
  isDark: boolean;
}

const API_BASE_URL = 'http://localhost:5000/api';
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Tasks({ isDark }: TasksPageProps) {
  const { isLoggedIn, setShowAuthModal } = useAuth();
  const [trackers, setTrackers] = useState<HabitTracker[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(!isLoggedIn);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ subject: '', target: '', color: 'bg-blue-500' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Convert tasks to habit tracker format
      const convertedTrackers = response.data.map((task: any, idx: number) => ({
        id: task._id,
        subject: task.category || task.title,
        target: task.description || 'Daily target',
        color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][idx % 5],
        weeklyProgress: {
          'Monday': false,
          'Tuesday': false,
          'Wednesday': false,
          'Thursday': false,
          'Friday': false,
          'Saturday': false,
          'Sunday': false,
        },
        backendData: task // Store original backend data
      }));
      
      setTrackers(convertedTrackers);
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Toggle daily completion
  const handleToggleDay = async (trackerId: string, day: string) => {
    const token = localStorage.getItem('token');
    
    setTrackers((prevTrackers) =>
      prevTrackers.map((tracker) =>
        tracker.id === trackerId
          ? {
              ...tracker,
              weeklyProgress: {
                ...tracker.weeklyProgress,
                [day]: !tracker.weeklyProgress[day],
              },
            }
          : tracker,
      ),
    );

    // Update backend
    try {
      await axios.put(`${API_BASE_URL}/tasks/${trackerId}`, 
        { category: trackerId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update task');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.subject.trim()) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tasks`,
        {
          title: newTask.subject,
          category: newTask.subject,
          description: newTask.target,
          priority: 'medium',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTracker: HabitTracker = {
        id: response.data._id,
        subject: newTask.subject,
        target: newTask.target,
        color: newTask.color,
        weeklyProgress: {
          'Monday': false,
          'Tuesday': false,
          'Wednesday': false,
          'Thursday': false,
          'Friday': false,
          'Saturday': false,
          'Sunday': false,
        },
      };

      setTrackers([...trackers, newTracker]);
      setNewTask({ subject: '', target: '', color: 'bg-blue-500' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add task');
    }
  };

  const handleDeleteTask = async (trackerId: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${trackerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackers(trackers.filter((t) => t.id !== trackerId));
    } catch (err) {
      console.error('Failed to delete task');
    }
  };

  // Calculate total progress
  const totalProgress = calculateTotalProgress(trackers);

  // Reset weekly progress
  const handleResetWeek = () => {
    if (confirm("Reset all progress for this week?")) {
      setTrackers((prevTrackers) =>
        prevTrackers.map((tracker) => ({
          ...tracker,
          weeklyProgress: {
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false,
            Sunday: false,
          },
        })),
      );
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <div
          className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? "bg-slate-950" : "bg-gray-50"}`}
        >
          <div
            className={`text-center p-8 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
          >
            <h1
              className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Login Required
            </h1>
            <p className={isDark ? "text-slate-400" : "text-gray-600"}>
              Please log in to access the task management system
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 ${isDark ? "bg-slate-950" : "bg-gray-50"}`}
    >
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1
              className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Study Tracker
            </h1>
            <p
              className={`mt-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}
            >
              Track your daily progress across all subjects
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${isDark ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
            >
              <Plus size={20} />
              Add Task
            </button>
            <button
              onClick={handleResetWeek}
              className={`px-6 py-3 rounded-lg font-semibold transition ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
            >
              Reset Week
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className={`rounded-lg border p-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Add New Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Subject/Task name"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <input
                type="text"
                placeholder="Target (e.g., 2Q/day)"
                value={newTask.target}
                onChange={(e) => setNewTask({ ...newTask, target: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <select
                value={newTask.color}
                onChange={(e) => setNewTask({ ...newTask, color: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="bg-blue-500">Blue</option>
                <option value="bg-green-500">Green</option>
                <option value="bg-purple-500">Purple</option>
                <option value="bg-pink-500">Pink</option>
                <option value="bg-indigo-500">Indigo</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddTask}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-6 py-2 rounded-lg font-semibold ${isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-900"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div
          className={`rounded-lg border p-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-blue-500" size={28} />
            <div>
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Weekly Progress
              </h2>
              <p className={isDark ? "text-slate-400" : "text-gray-600"}>
                Overall completion rate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Progress Bar */}
            <div>
              <ProgressBar
                progress={totalProgress}
                label="Total Progress"
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                isDark={isDark}
              />
              <p
                className={`mt-4 text-lg font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}
              >
                {totalProgress}% Complete
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-100"}`}
              >
                <div
                  className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  {trackers.length}
                </div>
                <div
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}
                >
                  Total Subjects
                </div>
              </div>

              <div
                className={`p-4 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-100"}`}
              >
                <div
                  className={`text-3xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
                >
                  {trackers.reduce(
                    (sum, t) =>
                      sum +
                      Object.values(t.weeklyProgress).filter((v) => v).length,
                    0,
                  )}
                </div>
                <div
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}
                >
                  Tasks Done
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Tracker Table */}
        <div
          className={`rounded-lg border p-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-purple-500" size={28} />
            <h2
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Weekly Targets
            </h2>
          </div>

          <WeeklyTracker
            trackers={trackers}
            onToggle={handleToggleDay}
            isDark={isDark}
            onDelete={handleDeleteTask}
          />
        </div>

        {/* Subject Progress Bars */}
        {/* <div
          className={`rounded-lg border p-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Subject Progress
          </h2> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <MonthlyProgress trackers={trackers} isDark={isDark} />
          </div>
            {/* {trackers.map((tracker) => (
              <div key={tracker.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${tracker.color}`} />
                  <span
                    className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}
                  >
                    {tracker.subject}
                  </span>
                  <span
                    className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}
                  >
                    ({tracker.target})
                  </span>
                </div>
                <ProgressBar
                  progress={calculateHabitProgress(tracker)}
                  color={tracker.color}
                  isDark={isDark}
                />
              </div>
            ))}
          </div> */}
        {/* </div> */} */

        {/* Contribution Graph */}
        <div>
          <ContributionGraph isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
