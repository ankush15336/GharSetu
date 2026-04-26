// ── GharSetu Realities — Contact Form (Web3Forms) ──
(function () {
    const ACCESS_KEY = '0a9e136d-6db8-42a8-992e-6e49d5d579ef';

    function initForm() {
        const form = document.getElementById('gs-contact-form');
        if (!form) return;

        const submitBtn = form.querySelector('.gf-submit');
        const statusEl = document.getElementById('gf-status');
        const spinner = submitBtn.querySelector('.gf-spinner');
        const btnText = submitBtn.querySelector('.gf-btn-text');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (submitBtn.disabled) return;

            // UI — loading
            submitBtn.disabled = true;
            spinner.style.display = 'block';
            btnText.textContent = 'Sending…';
            statusEl.className = '';
            statusEl.textContent = '';

            const callbackDate = form.querySelector('[name="callback_date"]')?.value?.trim() || '';
            let callbackSlot   = form.querySelector('[name="callback_slot"]')?.value?.trim() || '';
            const exactTime    = form.querySelector('[name="callback_exact_time"]')?.value?.trim() || '';

            // If "custom" slot selected, use the exact time input
            if (callbackSlot === 'custom' && exactTime) {
              // Convert HH:MM to 12-hr format for readability
              const [h, m] = exactTime.split(':').map(Number);
              const ampm = h >= 12 ? 'PM' : 'AM';
              const h12  = h % 12 || 12;
              callbackSlot = `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
            } else if (callbackSlot === 'custom') {
              callbackSlot = 'Exact time not specified';
            }

            const callbackInfo = callbackDate || callbackSlot
              ? `\n\n📅 CALLBACK REQUEST\nDate: ${callbackDate || 'Not specified'}\nTime: ${callbackSlot || 'Any time'}`
              : '';

            const payload = {
                access_key: ACCESS_KEY,
                subject: callbackDate
                  ? `🔔 Callback Requested — GharSetu (${callbackDate}, ${callbackSlot || 'Any time'})`
                  : 'New Enquiry — GharSetu Realities',
                name: form.querySelector('[name="name"]').value.trim(),
                email: form.querySelector('[name="email"]').value.trim(),
                phone: form.querySelector('[name="phone"]').value.trim(),
                message: (form.querySelector('[name="message"]').value.trim() || '(No message)') + callbackInfo,
                callback_date: callbackDate || 'Not requested',
                callback_time: callbackSlot || 'Any time',
                botcheck: ''
            };

            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await res.json();

                if (json.success) {
                    const callbackDate = form.querySelector('[name="callback_date"]')?.value?.trim();
                    const callbackSlot = form.querySelector('[name="callback_slot"]')?.value?.trim();
                    const exactTime    = form.querySelector('[name="callback_exact_time"]')?.value?.trim();
                    const timeLabel = callbackSlot === 'custom' && exactTime ? (() => {
                      const [h,m] = exactTime.split(':').map(Number);
                      return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
                    })() : callbackSlot;
                    if (callbackDate && timeLabel) {
                      statusEl.textContent = `✓ Callback scheduled for ${callbackDate} at ${timeLabel}. We will call you then!`;
                    } else {
                      statusEl.textContent = '✓ Message received! We will reach out within 24 hours.';
                    }
                    statusEl.className = 'gf-success';
                    form.reset();
                    document.getElementById('gf-custom-time-wrap').style.display = 'none';
                } else {
                    throw new Error(json.message || 'Submission failed');
                }
            } catch (err) {
                statusEl.textContent = '✗ Something went wrong. Please WhatsApp us directly at +91 91981 97668.';
                statusEl.className = 'gf-error';
            } finally {
                submitBtn.disabled = false;
                spinner.style.display = 'none';
                btnText.textContent = 'Send Enquiry';
            }
        });

        // Live validation helpers
        form.querySelectorAll('.gf-input').forEach(inp => {
            inp.addEventListener('blur', function () {
                this.classList.toggle('gf-touched', true);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();