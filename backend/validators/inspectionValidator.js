const Joi = require('joi')

// Validation schemas for inspection-related endpoints

const startInspectionSchema = Joi.object({
  inspectionId: Joi.string().required().messages({
    'any.required': 'inspectionId is required',
    'string.empty': 'inspectionId cannot be empty',
  }),
  latitude: Joi.number().required().min(-90).max(90).messages({
    'any.required': 'Latitude is required',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
  longitude: Joi.number().required().min(-180).max(180).messages({
    'any.required': 'Longitude is required',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  accuracy: Joi.number().optional().min(0).messages({
    'number.min': 'Accuracy cannot be negative',
  }),
}).unknown(false)

const submitChecklistSchema = Joi.object({
  inspectionId: Joi.string().required().messages({
    'any.required': 'inspectionId is required',
  }),
  checklist: Joi.object({
    infrastructure: Joi.string().required().min(5).messages({
      'string.min': 'Infrastructure feedback must be at least 5 characters',
    }),
    academic: Joi.string().required().min(5).messages({
      'string.min': 'Academic feedback must be at least 5 characters',
    }),
    governmentSchemes: Joi.string().required().min(5).messages({
      'string.min': 'Government schemes feedback must be at least 5 characters',
    }),
    safety: Joi.string().required().min(5).messages({
      'string.min': 'Safety feedback must be at least 5 characters',
    }),
  })
    .required()
    .messages({
      'any.required': 'Complete checklist is required',
    }),
  remarks: Joi.string().optional().allow('').max(1000).messages({
    'string.max': 'Remarks cannot exceed 1000 characters',
  }),
}).unknown(false)

const createIssueSchema = Joi.object({
  inspectionId: Joi.string().required().messages({
    'any.required': 'inspectionId is required',
  }),
  schoolId: Joi.string().optional().messages({
    'string.empty': 'schoolId cannot be empty',
  }),
  issueType: Joi.string()
    .required()
    .valid('INFRASTRUCTURE', 'ACADEMIC', 'SAFETY', 'GOVERNMENT_SCHEME', 'OTHER')
    .messages({
      'any.required': 'issueType is required',
      'any.only': 'Invalid issue type',
    }),
  title: Joi.string().required().min(3).max(200).messages({
    'any.required': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().required().min(10).max(2000).messages({
    'any.required': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  priority: Joi.string()
    .required()
    .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    .messages({
      'any.required': 'Priority is required',
      'any.only': 'Invalid priority level',
    }),
}).unknown(false)

const submitReportSchema = Joi.object({
  inspectionId: Joi.string().required().messages({
    'any.required': 'inspectionId is required',
  }),
  endLatitude: Joi.number().required().min(-90).max(90).messages({
    'any.required': 'End latitude is required',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
  endLongitude: Joi.number().required().min(-180).max(180).messages({
    'any.required': 'End longitude is required',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  otp: Joi.string().required().length(6).pattern(/^\d+$/).messages({
    'any.required': 'OTP is required',
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
  }),
})
  .unknown(false)
  .prefs({ convert: true })

const requestReportOtpSchema = Joi.object({
  inspectionId: Joi.string().required().messages({
    'any.required': 'inspectionId is required',
  }),
}).unknown(false)

module.exports = {
  startInspectionSchema,
  submitChecklistSchema,
  createIssueSchema,
  submitReportSchema,
  requestReportOtpSchema,
}
