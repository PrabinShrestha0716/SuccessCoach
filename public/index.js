// index.js (for your current login.html)

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const passwordInput = document.getElementById('password');
const passwordError = document.getElementById('password-error');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit');

// Password toggle
const toggleBtn = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const shown = passwordInput.type === 'text';
    passwordInput.type = shown ? 'password' : 'text';
    toggleBtn.setAttribute('aria-pressed', String(!shown));
    toggleBtn.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
    eyeIcon.innerHTML = shown
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>';
  });
}

function showError(el, errorEl, condition, message) {
  if (condition) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    el.setAttribute('aria-invalid', 'true');
  } else {
    errorEl.classList.add('hidden');
    el.removeAttribute('aria-invalid');
  }
}

function validate() {
  const emailValid = emailInput.value.trim().length > 3 && emailInput.validity.valid;
  const pwdValid = passwordInput.value.trim().length >= 8;

  showError(emailInput, emailError, !emailValid, 'Please enter a valid email.');
  showError(passwordInput, passwordError, !pwdValid, 'Password must be at least 8 characters.');

  submitBtn.disabled = !(emailValid && pwdValid);
  return emailValid && pwdValid;
}

emailInput.addEventListener('input', validate);
passwordInput.addEventListener('input', validate);
validate();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;
  if (form.website && form.website.value) return; // honeypot

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    remember: document.getElementById('remember')?.checked || false
  };

  submitBtn.disabled = true;
  statusEl.textContent = 'Signing you in…';

  try {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (res.ok) {
      statusEl.textContent = 'Success! Redirecting…';
      window.location.assign('/index.html'); // ✅ go to your app home
      return;
    }

    if (res.status === 404) {
      statusEl.innerHTML = `No account found for <strong>${payload.email}</strong>. <a href="/register.html" class="btn-link">Create one</a>.`;
      return;
    }

    if (res.status === 401) {
      statusEl.textContent = 'Invalid email or password.';
      return;
    }

    statusEl.textContent = 'Sign in failed. Please try again.';
  } catch (err) {
    statusEl.textContent = 'Network error. Please check your connection.';
  } finally {
    submitBtn.disabled = false;
  }
});
