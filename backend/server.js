import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:5173"];

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

let tasks = [];
let nextId = 1;

app.get("/tasks", (_req, res) => {
  res.status(200).json(tasks);
});

app.post("/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    return res.status(400).json({ error: "Title must not be empty." });
  }

  const newTask = {
    id: nextId++,
    title,
    status: "todo"
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid task id." });
  }

  if (status !== "todo" && status !== "done") {
    return res.status(400).json({ error: "Status must be 'todo' or 'done'." });
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  task.status = status;
  return res.status(200).json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid task id." });
  }

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  tasks.splice(index, 1);
  return res.status(200).json({ message: "Task deleted successfully." });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});
