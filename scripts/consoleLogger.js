// consoleLogger.js (Practice 10)
// Listens to "formValid" and prints form data to console.

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('formValid', (event) => {
    const formData = event.detail;

    console.clear();
    console.log('Full name:', formData.fullname);
    console.log('Phone:', formData.phone);
    console.log('Email:', formData.email);
    console.log('Message:', formData.message || '(not provided)');

    const timestamp = new Date().toLocaleString();
    console.log('Submitted at:', timestamp);
  });
});