const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body is invalid.',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
    }
    req.body = result.data;
    next();
  };
}
module.exports = { validate };
