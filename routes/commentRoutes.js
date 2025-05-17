const express = require("express");
const db = require("../models");
const { Comment, User, Task } = db;
const router = express.Router();
const {
  commentValidationSchema,
} = require("../validators/commentValidationSchema.js");
const { Auth, isAdmin } = require("../middlewares/auth.js");

router.post("/create-comment/:taskId", Auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const { error, value } = commentValidationSchema.validate({ content });
    if (error) {
      return res.status(403).json({ message: error.message });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await Comment.create({
      content: value.content,
      userId: req.user.id,
      taskId: parseInt(taskId),
    });

    const taskTitle = task.title;

    return res
      .status(201)
      .json({ message: "Comment created successfully", comment, taskTitle });
  } catch (error) {
    return res.status(402).json({ message: error.message });
  }
});

router.patch("/edit-comments/:taskId", Auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const { error, value } = commentValidationSchema.validate({ content });
    if (error) return res.status(400).json({ message: error.message });

    const comment = await Comment.findByPk(taskId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comment" });
    }

    comment.content = value.content;
    await comment.save();

    return res
      .status(200)
      .json({ message: "Comment updated successfully", comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-comments/:taskId", Auth, async (req, res) => {
  try {
    const { taskId } = req.params;

    const comment = await Comment.findByPk(taskId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comment" });
    }

    await comment.destroy();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
});

router.delete("/admin-only-delete/:commentId", Auth, isAdmin, async (req, res) => {
  try {
  const { commentId } = req.params;

  const comment = await Comment.findByPk(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  await Comment.destroy({ where: { id: commentId } });
  
  return res.status(200).json({ message: "Deleted by an Admin" });
  } catch (error) { return res.status(500).json({ message: error.message }) }
});

module.exports = router;
