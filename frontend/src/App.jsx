import { useEffect, useMemo, useState } from "react";
import { FiArrowLeftCircle, FiArrowRightCircle, FiCheckCircle, FiPlus, FiTrash2 } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong.");
  }
  return data;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todoTasks = useMemo(() => tasks.filter((task) => task.status === "todo"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((task) => task.status === "done"), [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetch(`${API_BASE_URL}/tasks`);
      const parsed = await parseResponse(data);
      setTasks(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Title must not be empty.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle })
      });
      const created = await parseResponse(response);
      setTasks((prev) => [...prev, created]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "todo" ? "done" : "todo";
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await parseResponse(response);
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
      await parseResponse(response);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <section className="app-shell">
        <header className="topbar">
          <h1>Kanban Task Manager</h1>
          <p>Plan your day with clear focus.</p>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Task title"
          />
          <button type="submit" disabled={submitting}>
            <FiPlus />
            Add
          </button>
        </form>

        {loading && <p className="info">Loading tasks...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && (
          <div className="board">
            <TaskColumn title="To Do" icon={<FiArrowRightCircle />} tasks={todoTasks} onToggle={toggleStatus} onDelete={deleteTask} />
            <TaskColumn title="Done" icon={<FiCheckCircle />} tasks={doneTasks} onToggle={toggleStatus} onDelete={deleteTask} />
          </div>
        )}
      </section>
    </main>
  );
}

function TaskColumn({ title, icon, tasks, onToggle, onDelete }) {
  return (
    <article className="column">
      <header className="column-head">
        <span className="column-title">
          {icon}
          {title}
        </span>
        <span className="count">{tasks.length}</span>
      </header>

      <div className="tasks">
        {tasks.length === 0 && <p className="empty">No tasks yet.</p>}

        {tasks.map((task) => (
          <div className="task-card" key={task.id}>
            <p>{task.title}</p>
            <div className="task-actions">
              <button className="ghost" onClick={() => onToggle(task)} aria-label="Toggle status">
                {task.status === "todo" ? <FiCheckCircle /> : <FiArrowLeftCircle />}
              </button>
              <button className="ghost danger" onClick={() => onDelete(task.id)} aria-label="Delete task">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
