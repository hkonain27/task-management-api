import prisma from "../lib/prisma.js";

// CREATE
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId: req.user.id,
      },
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Create project failed", error: error.message });
  }
};

// READ ALL
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: req.user.role === "ADMIN" ? {} : { userId: req.user.id },
    });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// READ ONE
export const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to view this project." });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// UPDATE
export const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (existingProject.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this project." });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { title, description },
    });

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// DELETE
export const deleteProject = async (req, res) => {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (existingProject.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this project." });
    }

    await prisma.project.delete({
      where: { id: Number(req.params.id) },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Delete failed", error: error.message });
  }
};