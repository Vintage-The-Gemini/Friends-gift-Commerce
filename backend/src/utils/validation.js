// src/utils/validation.js
const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
    phoneNumber: Joi.string()
        .pattern(/^\+254[0-9]{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be in the format +254XXXXXXXXX',
            'any.required': 'Phone number is required'
        }),
    
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        }),
    
    role: Joi.string()
        .valid('buyer', 'seller')
        .required()
        .messages({
            'any.only': 'Role must be either buyer or seller',
            'any.required': 'Role is required'
        }),
    
    businessName: Joi.when('role', {
        is: 'seller',
        then: Joi.string().required().messages({
            'any.required': 'Business name is required for sellers'
        }),
        otherwise: Joi.string().optional()
    })
});

// Login validation schema
const loginSchema = Joi.object({
    phoneNumber: Joi.string()
        .pattern(/^\+254[0-9]{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be in the format +254XXXXXXXXX',
            'any.required': 'Phone number is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Middleware to validate request body
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    };
};

module.exports = {
    registerSchema,
    loginSchema,
    validateRequest
};