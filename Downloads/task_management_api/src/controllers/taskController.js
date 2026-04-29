import prisma from "../lib/prisma.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, status, projectId, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required." });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to add tasks to this project." });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        projectId: Number(projectId),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Create task failed.", error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where:
        req.user.role === "ADMIN"
          ? {}
          : {
              project: {
                userId: req.user.id,
              },
            },
      include: {
        project: true,
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Fetch tasks failed.", error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (task.project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to view this task." });
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Fetch task failed.", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (existingTask.project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this task." });
    }

    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
      },
    });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Update task failed.", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (existingTask.project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this task." });
    }

    await prisma.task.delete({
      where: { id: Number(req.params.id) },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Delete task failed.", error: error.message });
  }
};