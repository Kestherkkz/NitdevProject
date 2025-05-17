const Joi = require("joi");

const commentValidationSchema = Joi.object({
    content : Joi.string().min(2).max(50).message({
    "string.min": "Comment must be at least 2 characters",
    "string.max": "Comment must not exceed 30 characters",
    })
})

module.exports = {
    commentValidationSchema
}