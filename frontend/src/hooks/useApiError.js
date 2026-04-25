/**
 * Utility to extract a structured error from an Axios error response.
 *
 * The backend always returns:
 *   { success, message, errorCode, errors?: [{field, message}], field?: string }
 *
 * Usage in a component:
 *   import { parseApiError, getFieldError } from "@/hooks/useApiError";
 *
 *   const { message, errors, errorCode } = parseApiError(err);
 *   const emailError = getFieldError(errors, "email");
 */

/**
 * Parse an Axios error into a structured object.
 */
export function parseApiError(error) {
  const data = error?.response?.data;
  return {
    message: data?.message || error?.message || "Something went wrong",
    errorCode: data?.errorCode || null,
    errors: Array.isArray(data?.errors) ? data.errors : [],
    field: data?.field || null,
  };
}

/**
 * Get the first error message for a specific field.
 */
export function getFieldError(errors, fieldName) {
  if (!Array.isArray(errors)) return null;
  const found = errors.find((e) => e.field === fieldName);
  return found?.message || null;
}

/**
 * Build a field-error map: { email: "email is required", name: "..." }
 */
export function buildFieldErrors(errors) {
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, err) => {
    if (err.field) acc[err.field] = err.message;
    return acc;
  }, {});
}
