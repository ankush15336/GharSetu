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

            const payload = {
                access_key: ACCESS_KEY,
                subject: 'New Enquiry — GharSetu Realities',
                name: form.querySelector('[name="name"]').value.trim(),
                email: form.querySelector('[name="email"]').value.trim(),
                phone: form.querySelector('[name="phone"]').value.trim(),
                message: form.querySelector('[name="message"]').value.trim(),
                botcheck: ''          // honeypot
            };

            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await res.json();

                if (json.success) {
                    statusEl.textContent = '✓ Message received! We will reach out within 24 hours.';
                    statusEl.className = 'gf-success';
                    form.reset();
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