const express = require("express");
const db = require("../models");
const { Task, User } = db;
const router = express.Router();
const { sendTaskEmail } = require("../services/taskCreatedMail.js");
const { sendStatusChangeNotification } = require("../services/sendStatusMail.js")
const { Auth, isAdmin } = require("../middlewares/auth.js");
const {
  createTaskValidationSchema,
  taskAssigningValidationSchema,
  updateStatusSchema,
  tagValidationSchema
} = require("../validators/taskValidationSchema.js");
const { sendAssignedUserEmail } = require("../services/sendAssignedUserEmail.js");

router.post("/createtask", Auth, async (req, res) => {
  try {
    const { title, description, dueDate, assignedToId } = req.body;

    const { error, value } = createTaskValidationSchema.validate({
      title,
      description,
      dueDate,
      assignedToId,
    });

    if (error) {
      return res.status(403).json({ message: error.message });
    }

    let assignedUser = null;

    if (value.assignedToId) {
      assignedUser = await User.findByPk(value.assignedToId);
      if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found" });
      }

      await sendAssignedUserEmail({
        firstName: assignedUser.firstName,
        title: value.title,
        dueDate: value.dueDate,
        email: assignedUser.email,
      });
    }

    const task = await Task.create({
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
      createdById: req.user.id,
      assignedToId: value.assignedToId || null,
    });

    await sendTaskEmail({
      firstName: req.user.firstName,
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
      email: req.user.email,
    });

    return res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/assign/:id", Auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { assignedToId } = req.body;
    const { error, value } = taskAssigningValidationSchema.validate({ assignedToId })
    if (error) { return res.status(402).json({ message: error.message })}


    const task = await Task.findByPk(taskId);
    if (!task) { return res.status(404).json({ message: "Task not found" }) }
    

    const user = await User.findByPk(value.assignedToId);
    if (!user) { return res.status(404).json({ message: "Assigned User not found" }) }

    task.assignedToId = value.assignedToId;
    await task.save();

    await sendAssignedUserEmail({
      firstName: user.firstName,
      email: user.email,
      title: task.title,
      dueDate: task.dueDate,
    });

    return res.status(200).json({ message: "Task assigned successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/status/:id", Auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    const { error, value} = updateStatusSchema.validate({ status })
    if (error) { return res.status(403).json({ message: error.message })}

    const task = await Task.findByPk(taskId);
    if (!task) { return res.status(404).json({ message: "Task not found" }) }

    if (task.createdById !== req.user.id) { return res.status(403).json({ message: "Sorry, You can only update your own tasks" }) }

    task.status = value.status;
    await task.save();

   if (task.assignedToId) {
      const assignedUser = await User.findByPk(task.assignedToId);
      if (assignedUser) {
        await sendStatusChangeNotification({
          firstName: assignedUser.firstName,
          title: task.title,
          status: value.status,
          email: assignedUser.email,
        });
      }
    }

    return res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
});

router.patch("/admin/status/:id", Auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error, value } = updateStatusSchema.validate({ status });
    if (error) { return res.status(400).json({ message: error.message }) }

    const task = await Task.findByPk(id);
    if (!task) { return res.status(404).json({ message: "Task not found" }) }

    task.status = value.status;
    await task.save();

       if (task.assignedToId) {
      const assignedUser = await User.findByPk(task.assignedToId);
      if (assignedUser) {
        await sendStatusChangeNotification({
          firstName: assignedUser.firstName,
          title: task.title,
          status: value.status,
          email: assignedUser.email,
        });
      }
    }

    return res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
});

router.get("/all-tasks", Auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const tasks = await Task.findAll({
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email"]
        }
      ]
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No Tasks Found In Our Records" });
    }

    const totalTasks = await Task.count();
    const totalPages = Math.ceil(totalTasks / pageSize);

    return res.status(200).json({
      message: "All Tasks Retrieved Successfully.",
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks,
      tasks: tasks
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/tasktag/:taskId", Auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { tag } = req.body;

    const { error, value } = tagValidationSchema.validate({ tag });
    if ( error ) { return res.status(403).json({ message: error.message })};

    const task = await Task.findByPk(taskId);
    if (!task) { return res.status(404).json({ message: "Task not found" })};

    task.tag = value.tag; 
    await task.save();

    return res.status(200).json({ message: "Task updated successfully", task });
  } 
  catch (error) { return res.status(500).json({ message: error.message })
  }
});

router.get("/task/tag", Auth, async (req, res) => {
  try {
    const { tag } = req.query;

    const filtered = {};

    if (tag) {
      const validTags = ["Urgent", "Bug", "Feature"];
      if (!validTags.includes(tag)) {
        return res.status(400).json({ message: "Invalid tag" });
      }

      filtered.tag = tag;
    }

    const tasks = await Task.findAll({ where: filtered });

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
});


module.exports = router;