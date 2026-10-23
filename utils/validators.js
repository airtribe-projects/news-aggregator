const isValidPreferences = (preferences) =>
  Array.isArray(preferences) &&
  preferences.every((p) => typeof p === "string" && p.trim() !== "");

const isValidEmail = (email) => {
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return typeof email === "string" && emailRegex.test(email.trim());
};

const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password) <= 72
  );
};
module.exports = { isValidPreferences, isValidEmail, isValidPassword };
