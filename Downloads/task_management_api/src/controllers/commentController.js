import prisma from "../lib/prisma.js";

export const createComment = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    if (!content || !taskId) {
      return res.status(400).json({ message: "Content and taskId are required." });
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (task.project.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to comment on this task." });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: Number(taskId),
        userId: req.user.id,
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Create comment failed.", error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where:
        req.user.role === "ADMIN"
          ? {}
          : {
              task: {
                project: {
                  userId: req.user.id,
                },
              },
            },
      include: {
        task: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: "Fetch comments failed.", error: error.message });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        task: {
          include: { project: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const isOwner = comment.userId === req.user.id;
    const isProjectOwner = comment.task.project.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isProjectOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this comment." });
    }

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Fetch comment failed.", error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (existingComment.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this comment." });
    }

    const comment = await prisma.comment.update({
      where: { id: Number(req.params.id) },
      data: { content },
    });

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Update comment failed.", error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (existingComment.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this comment." });
    }

    await prisma.comment.delete({
      where: { id: Number(req.params.id) },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Delete comment failed.", error: error.message });
  }
};