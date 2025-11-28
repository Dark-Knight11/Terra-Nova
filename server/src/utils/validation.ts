import Joi from 'joi';

// Email validation
export const emailSchema = Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    });

// Password validation - minimum 8 characters, at least one uppercase, one lowercase, one number
export const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
    });

// Ethereum address validation
export const walletAddressSchema = Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .messages({
        'string.pattern.base': 'Invalid Ethereum wallet address format'
    });

// User role validation
export const roleSchema = Joi.string()
    .valid('COMPANY', 'AUDITOR', 'REGISTRY')
    .required()
    .messages({
        'any.only': 'Role must be one of: COMPANY, AUDITOR, REGISTRY',
        'any.required': 'Role is required'
    });

// Registration schema
export const registrationSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
    companyName: Joi.when('role', {
        is: 'COMPANY',
        then: Joi.string().min(2).max(200).required().messages({
            'any.required': 'Company Name is required for Company role',
            'string.min': 'Company Name must be at least 2 characters',
            'string.max': 'Company Name cannot exceed 200 characters'
        }),
        otherwise: Joi.string().allow('', null).optional()
    })
});

// Login schema
export const loginSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema
});

// Wallet address parameter schema
export const walletParamSchema = Joi.object({
    address: walletAddressSchema.required()
});

// SIWE verification schema
export const siweVerificationSchema = Joi.object({
    message: Joi.string().required(),
    signature: Joi.string().required(),
    walletAddress: walletAddressSchema.required()
});

// Company creation schema
export const companyCreateSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    country: Joi.string().max(100).optional(),
    industry: Joi.string().max(100).optional(),
    carbonFootprint: Joi.number().min(0).optional(),
    walletAddress: walletAddressSchema.optional()
});

// Company update schema
export const companyUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    country: Joi.string().max(100).optional(),
    industry: Joi.string().max(100).optional(),
    carbonFootprint: Joi.number().min(0).optional(),
    walletAddress: walletAddressSchema.optional()
});

// Auditor creation schema
export const auditorCreateSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    certifications: Joi.array().items(Joi.string()).optional(),
    walletAddress: walletAddressSchema.optional()
});

// Registry creation schema
export const registryCreateSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    jurisdiction: Joi.string().max(100).optional(),
    walletAddress: walletAddressSchema.optional()
});

// Helper function to validate request body
export const validateRequest = (schema: Joi.ObjectSchema, data: any) => {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        console.log('Validation Error Details:', JSON.stringify(error.details, null, 2));
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        throw new ValidationError('Validation failed', errors);
    }

    return value;
};

import { ValidationError } from '../middleware/errorHandler';
