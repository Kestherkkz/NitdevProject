const Joi = require("joi");

const createTaskValidationSchema = Joi.object({
  title: Joi.string().min(2).max(30).required().messages({
    "any.required": "Please Input Task Title",
    "string.min": "Title must be at least 2 characters",
    "string.max": "Title must not exceed 30 characters",
  }),
  description: Joi.string().required().messages({
    "any.required": "Description is Required",
  }),
  dueDate: Joi.date().required().messages({
    "any.required": "Kindly State the Due-Date",
  }),
  assignedToId: Joi.number().integer().optional().messages({
    "number.integer": "Assigned user ID must be an integer",
  })
});

const taskAssigningValidationSchema = Joi.object({
  assignedToId: Joi.number().integer().optional().messages({
    "number.integer": "Assigned user ID must be an integer",
  })
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("Pending", "In Progress", "Completed").required().messages({
    "any.only": "Status must be one of: Pending, In Progress, Completed",
    "any.required": "Status is required",
  })
});

const tagValidationSchema = Joi.object({
  tag : Joi.string().valid('Urgent', 'Bug', 'Feature').allow(null).messages({
    "any.only": "Tag must be one of [Urgent, Bug, Feature]",
  })
})

module.exports = {
  createTaskValidationSchema,
  taskAssigningValidationSchema,
  updateStatusSchema,
  tagValidationSchema
};
