// login.js

// Attach event listener after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form"); // your login/signup form

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // prevent form reload
      // 🚀 For now, just redirect directly to index.html
      window.location.href = "index.html";
    });
  }
});

// Optional: password toggle handler
function togglePassword() {
  const passwordField = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    eyeIcon.setAttribute("stroke", "blue");
  } else {
    passwordField.type = "password";
    eyeIcon.setAttribute("stroke", "currentColor");
  }
}
