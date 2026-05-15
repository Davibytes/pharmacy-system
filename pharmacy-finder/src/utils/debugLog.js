export const debugLog = (label, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${label}: ${message}`, data || '');
};