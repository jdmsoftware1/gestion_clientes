// Utility function to transform snake_case dates to camelCase for frontend compatibility
export function transformDatesForFrontend(obj) {
  if (!obj) return obj;
  
  // If it's an array, transform each item
  if (Array.isArray(obj)) {
    return obj.map(item => transformDatesForFrontend(item));
  }
  
  // If it's a Sequelize model instance, convert to JSON first
  const jsonObj = typeof obj.toJSON === 'function' ? obj.toJSON() : obj;
  
  // Transform the object
  const transformed = { ...jsonObj };
  
  // Transform common date fields
  if (jsonObj.created_at) {
    transformed.createdAt = jsonObj.created_at;
    delete transformed.created_at;
  }
  
  if (jsonObj.updated_at) {
    transformed.updatedAt = jsonObj.updated_at;
    delete transformed.updated_at;
  }
  
  // Transform nested objects (like included models)
  Object.keys(transformed).forEach(key => {
    if (transformed[key] && typeof transformed[key] === 'object' && !Array.isArray(transformed[key]) && !(transformed[key] instanceof Date)) {
      transformed[key] = transformDatesForFrontend(transformed[key]);
    }
  });
  
  return transformed;
}

export default transformDatesForFrontend;
