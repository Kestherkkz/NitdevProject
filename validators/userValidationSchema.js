const Joi = require("joi");

const userSignUpValidationSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().messages({
    "any.required": "Please Fill In Your First Name",
  }),
  lastName: Joi.string().min(2).max(30).required().messages({
    "any.required": "Please Fill In Your Last Name",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
  password: Joi.string().min(8).max(30).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 15 characters",
  }),
});

const loginUserValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
  password: Joi.string().min(8).max(30).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 15 characters",
  }),
});

const changeUserPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
  password: Joi.string().min(8).max(30).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 15 characters",
  }),
  newPassword: Joi.string().min(8).max(30).required().messages({
    "any.required": "Please Input Your New Password",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 15 characters",
  }),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
  otp: Joi.string().required().length(6).messages({
    "any.required": "Otp is Required",
    "string.length": "OTP must be exactly 6 digits",
  }),
});

const resetUserPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  })
});

const verifyResetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
  otp: Joi.string().required().length(6).messages({
    "any.required": "Otp is Required",
    "string.length": "OTP must be exactly 6 digits",
  }),
  newPassword: Joi.string().min(8).max(30).required().messages({
    "any.required": "Please Input Your New Password",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 15 characters",
  }),
});

const resendValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please Input Your Email",
    "string.email": "Please Enter a Valid Email Address",
  }),
})


module.exports = {
  userSignUpValidationSchema,
  loginUserValidationSchema,
  changeUserPasswordSchema,
  verifyEmailSchema,
  resetUserPasswordSchema,
  verifyResetPasswordSchema,
  resendValidationSchema
};