// validation.js (Practice 10)
// - prevents default submit
// - validates fields by IDs: fullname, phone, email, message, agreement
// - shows errors visually (daisyUI-style) + inline messages
// - dispatches CustomEvent('formValid', { detail: formData })

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const fullname = document.getElementById('fullname');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const agreement = document.getElementById('agreement');

  const successBox = document.getElementById('formSuccess');
  const messageCount = document.getElementById('messageCount');

  // --- helpers ---
  const digitsOnly = (s) => (s || '').replace(/\D/g, '');

  function clearErrors() {
    // remove error classes
    [fullname, phone, email, message, agreement].forEach((el) => {
      if (!el) return;

      // inputs/textareas
      el.classList.remove('input-error', 'textarea-error');
      // checkbox visual: we'll mark label text instead via injected error
    });

    // remove injected error messages
    document.querySelectorAll('[data-error-for]').forEach((node) => node.remove());
  }

  function showError(fieldEl, text) {
    // Apply daisyUI error styles
    if (fieldEl.tagName === 'TEXTAREA') fieldEl.classList.add('textarea-error');
    else if (fieldEl.type !== 'checkbox') fieldEl.classList.add('input-error');

    const msg = document.createElement('div');
    msg.dataset.errorFor = fieldEl.id;
    msg.className = 'mt-1 text-sm text-red-600';
    msg.textContent = text;

    // Place error message in a consistent place:
    // - for checkbox: after the checkbox label
    // - for inputs: after the control (field element)
    if (fieldEl.type === 'checkbox') {
      // checkbox is inside label; insert after that label
      const label = fieldEl.closest('label');
      if (label && label.parentNode) label.parentNode.insertBefore(msg, label.nextSibling);
      return;
    }

    // try insert after field
    fieldEl.insertAdjacentElement('afterend', msg);
  }

  function setSuccessVisible(isVisible) {
    if (!successBox) return;
    successBox.classList.toggle('hidden', !isVisible);
  }

  // --- nicer UX: phone formatting (+7 (XXX) XXX-XX-XX) ---
  function formatPhoneRU(raw) {
    const d = digitsOnly(raw);
    // we accept any >=10 digits, but format last 10 as RU pattern
    const last10 = d.length >= 10 ? d.slice(-10) : d;

    let out = '+7';
    if (last10.length > 0) out += ' (' + last10.slice(0, 3);
    if (last10.length >= 3) out += ') ' + last10.slice(3, 6);
    if (last10.length >= 6) out += '-' + last10.slice(6, 8);
    if (last10.length >= 8) out += '-' + last10.slice(8, 10);

    return out;
  }

  if (phone) {
    phone.addEventListener('input', () => {
      // do not hard-block typing; just gently format if user pasted digits
      const d = digitsOnly(phone.value);
      if (d.length >= 4) {
        const caretAtEnd = phone.selectionStart === phone.value.length;
        phone.value = formatPhoneRU(phone.value);
        if (caretAtEnd) {
          // keep cursor at end (simple approach)
          phone.selectionStart = phone.selectionEnd = phone.value.length;
        }
      }
    });
  }

  // --- message counter ---
  if (message && messageCount) {
    const updateCount = () => {
      messageCount.textContent = String(message.value.length);
    };
    updateCount();
    message.addEventListener('input', updateCount);
  }

  // --- clear errors on input/change (per методичке idea) ---
  [fullname, phone, email, message].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      // remove error state + remove message for that field
      el.classList.remove('input-error', 'textarea-error');
      document.querySelectorAll(`[data-error-for="${el.id}"]`).forEach((n) => n.remove());
      setSuccessVisible(false);
    });
  });

  if (agreement) {
    agreement.addEventListener('change', () => {
      document.querySelectorAll(`[data-error-for="${agreement.id}"]`).forEach((n) => n.remove());
      setSuccessVisible(false);
    });
  }

  // --- reset clears errors + success ---
  form.addEventListener('reset', () => {
    // let the browser reset first
    setTimeout(() => {
      clearErrors();
      setSuccessVisible(false);
      if (message && messageCount) messageCount.textContent = String(message.value.length);
    }, 0);
  });

  // --- submit validation ---
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setSuccessVisible(false);
    clearErrors();

    let isValid = true;

    // 1) Fullname: not empty, >= 2 words (as in methodic)
    const fullnameValue = (fullname?.value || '').trim();
    const words = fullnameValue.split(' ').filter((w) => w.length > 0);

    if (!fullnameValue) {
      showError(fullname, 'Please enter your full name.');
      isValid = false;
    } else if (words.length < 2) {
      showError(fullname, 'Enter at least 2 words (first + last name).');
      isValid = false;
    }

    // 2) Phone: not empty, >= 10 digits
    const phoneValue = (phone?.value || '').trim();
    const phoneDigits = digitsOnly(phoneValue);

    if (!phoneValue) {
      showError(phone, 'Please enter your phone number.');
      isValid = false;
    } else if (phoneDigits.length < 10) {
      showError(phone, 'Phone must contain at least 10 digits.');
      isValid = false;
    }

    // 3) Email: not empty, simple check (contains @ and .)
    const emailValue = (email?.value || '').trim();

    if (!emailValue) {
      showError(email, 'Please enter your email.');
      isValid = false;
    } else if (!emailValue.includes('@') || !emailValue.includes('.')) {
      showError(email, 'Please enter a valid email.');
      isValid = false;
    }

    // 4) Agreement: required
    if (!agreement?.checked) {
      showError(agreement, 'Consent is required.');
      isValid = false;
    }

    if (!isValid) return;

    // If valid: build formData and dispatch event (as in methodic)
    const formData = {
      fullname: fullnameValue,
      phone: phoneValue,
      email: emailValue,
      message: (message?.value || '').trim() || '(not provided)',
    };

    const customEvent = new CustomEvent('formValid', { detail: formData });
    document.dispatchEvent(customEvent);

    setSuccessVisible(true);

    // Optional UX: reset form after success
    form.reset();
  });
});