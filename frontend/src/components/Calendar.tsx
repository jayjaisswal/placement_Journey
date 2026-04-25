import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface DailyTask {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  time?: string;
}

export const Calendar = ({ isDark }: { isDark: boolean }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [newTask, setNewTask] = useState({ title: "", time: "" });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, apiClient } = useAuth();

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  useEffect(() => {
    if (user && selectedDate) {
      fetchDailyTasks(selectedDate);
    }
  }, [selectedDate, user]);

  const fetchDailyTasks = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const res = await apiClient.get("/daily-tasks/date/" + dateStr);
      setDailyTasks(res.data);
    } catch (err) {
      console.error("Error fetching daily tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const addDailyTask = async () => {
    if (!newTask.title || !selectedDate) return;

    try {
      const res = await apiClient.post("/daily-tasks", {
        date: selectedDate.toISOString(),
        day: selectedDate.toLocaleDateString("en-US", { weekday: "long" }),
        title: newTask.title,
        time: newTask.time,
        priority: "medium",
      });
      setDailyTasks([...dailyTasks, res.data]);
      setNewTask({ title: "", time: "" });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const res = await apiClient.put(`/daily-tasks/${taskId}`, { completed: !completed });
      setDailyTasks(dailyTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiClient.delete(`/daily-tasks/${taskId}`);
      setDailyTasks(dailyTasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected =
        selectedDate &&
        selectedDate.toDateString() === date.toDateString();

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          onClick={() => setSelectedDate(date)}
          className={`p-2 rounded-lg transition-all ${
            isSelected
              ? isDark
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              : isDark
              ? "hover:bg-slate-800"
              : "hover:bg-slate-100"
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className={`rounded-xl border ${isDark ? "bg-slate-900/50 border-slate-700/50" : "bg-white border-slate-200"} p-6`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-500 mb-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      {/* Daily Tasks */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-slate-700/30 pt-4">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Tasks for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </h3>

          {/* Add Task Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={`flex-1 px-3 py-2 rounded-lg ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-100 border-slate-300 text-slate-900"
              } border`}
            />
            <input
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              className={`px-3 py-2 rounded-lg ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-100 border-slate-300 text-slate-900"
              } border`}
            />
            <button
              onClick={addDailyTask}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : dailyTasks.length === 0 ? (
            <div className={`text-center p-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              No tasks for this date
            </div>
          ) : (
            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDark ? "bg-slate-800/50" : "bg-slate-100"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task._id, task.completed)}
                    className={`p-2 rounded-full transition-all ${
                      task.completed
                        ? "bg-green-500/20 text-green-500"
                        : "bg-slate-700/20 text-slate-400 hover:bg-slate-600/20"
                    }`}
                  >
                    <Check size={16} />
                  </button>
                  <div className="flex-1">
                    <p className={`${task.completed ? "line-through text-slate-500" : ""}`}>
                      {task.title}
                    </p>
                    {task.time && <p className="text-xs text-slate-500">{task.time}</p>}
                  </div>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
