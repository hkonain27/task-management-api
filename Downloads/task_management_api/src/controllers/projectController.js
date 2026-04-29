import prisma from "../lib/prisma.js";

// CREATE
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Create project failed", error: error.message });
  }
};

// READ ALL
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// READ ONE
export const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!project) return res.status(404).json({ message: "Not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// UPDATE
export const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// DELETE
export const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};