# EmailJS Templates

Use these HTML bodies in EmailJS with the Tutor branding.

- OTP template ID: template_72fcfag
- Contact template ID: template_oluy1vb

## OTP Template

```html
<div style="margin:0;padding:0;background:linear-gradient(180deg,#fff7f7 0%,#f8fafc 100%);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <div style="background:linear-gradient(135deg,#7f1d1d 0%,#b91c1c 55%,#dc2626 100%);border-radius:28px;padding:30px;color:#fff;box-shadow:0 18px 50px rgba(127,29,29,.22);">
      <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.14);font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;">
        TutorKE
      </div>
      <p style="margin:20px 0 0;font-size:16px;line-height:1.75;">Hi {{to_name}},</p>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.75;">Use this one time password to complete your TutorKE sign in or sign up.</p>
      <div style="margin:26px 0;padding:20px;border-radius:20px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);text-align:center;">
        <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;opacity:.78;">Verification Code</div>
        <div style="margin-top:10px;font-size:36px;font-weight:800;letter-spacing:.18em;">{{passcode}}</div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;opacity:.92;">This code expires at <strong>{{time}}</strong>.</p>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.7;opacity:.9;">If you did not request this, ignore this email. TutorKE will never ask for your code outside the platform.</p>
      <p style="margin:20px 0 0;font-size:14px;line-height:1.7;opacity:.9;">Visit <a href="{{website_link}}" style="color:#fff;font-weight:700;text-decoration:underline;">{{website_link}}</a></p>
    </div>
  </div>
</div>
```

## Contact Template

```html
<div style="margin:0;padding:0;background:linear-gradient(180deg,#fffdf8 0%,#f8fafc 100%);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.06);">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">T</div>
        <div>
          <div style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#64748b;font-weight:700;">TutorKE Contact</div>
          <div style="font-size:20px;font-weight:800;color:#0f172a;">New message received</div>
        </div>
      </div>

      <p style="margin:24px 0 0;font-size:15px;line-height:1.75;color:#334155;">A message by <strong>{{name}}</strong> has been received. Kindly respond at your earliest convenience.</p>

      <div style="margin-top:20px;padding:18px;border-radius:18px;background:#f8fafc;border:1px dashed #cbd5e1;">
        <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.18em;font-weight:700;">Sender Details</div>
        <div style="margin-top:12px;font-size:15px;color:#0f172a;line-height:1.8;">
          <div><strong>Name:</strong> {{name}}</div>
          <div><strong>Email:</strong> {{email}}</div>
          <div><strong>Phone:</strong> {{phone}}</div>
          <div><strong>Subject:</strong> {{subject}}</div>
          <div><strong>Time:</strong> {{time}}</div>
        </div>
      </div>

      <div style="margin-top:18px;padding:18px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;">
        <div style="font-size:13px;color:#9a3412;text-transform:uppercase;letter-spacing:.18em;font-weight:700;">Message</div>
        <p style="margin:10px 0 0;font-size:15px;line-height:1.8;color:#7c2d12;white-space:pre-wrap;">{{message}}</p>
      </div>
    </div>
  </div>
</div>
```