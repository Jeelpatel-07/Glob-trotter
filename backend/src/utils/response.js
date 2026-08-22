/**
 * Standard success response
 * Frontend expects: res.data (axios strips outer), then accesses .data on the result
 * So HTTP body = { data: <payload> } for data responses
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

/**
 * Success response with message only
 */
export const sendMessage = (res, message, statusCode = 200) => {
  return res.status(statusCode).json({ message });
};

/**
 * Standard error response
 * Frontend reads: error.response?.data?.message
 */
export const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ message });
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
