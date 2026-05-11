const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function brandedEmail(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 36px;text-align:center;">
              <p style="margin:0;font-size:28px;">🐾</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Cutz to Cuddlez</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#fef3c7;opacity:0.9;">Professional Pet Care Services</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1c1917;">${title}</h2>
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#faf7f2;padding:20px 36px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Cutz to Cuddlez · All rights reserved</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">You're receiving this because you have an account with us.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

async function sendEmail({ to, subject, title, bodyHtml }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email skipped - no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Cutz to Cuddlez" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: brandedEmail(title, bodyHtml),
    });
  } catch (err) {
    console.error('[Email send error]', err.message);
  }
}

// ─── Templates ─────────────────────────────────────────────────────────────

function infoRow(label, value) {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;">${label}</span><br><span style="font-size:14px;font-weight:600;color:#1c1917;">${value}</span></td></tr>`;
}

function statusBadge(label, color, bg) {
  return `<span style="display:inline-block;padding:4px 14px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;background:${bg};color:${color};">${label}</span>`;
}

function ctaButton(label, href) {
  if (!href) return '';
  return `<div style="margin-top:24px;text-align:center;"><a href="${href}" style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">
    ${label}
  </a></div>`;
}

// Admin: new boarding request
async function sendBoardingRequestedAdmin({ adminEmail, userName, petName, startDate, endDate, totalDays }) {
  await sendEmail({
    to: adminEmail,
    subject: `🏠 New Boarding Request — ${petName}`,
    title: 'New Boarding Request',
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">A customer has submitted a new boarding request that needs your review.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Customer', userName)}
        ${infoRow('Pet', petName)}
        ${infoRow('Check-in', startDate)}
        ${infoRow('Check-out', endDate)}
        ${infoRow('Duration', `${totalDays} night${totalDays !== 1 ? 's' : ''}`)}
        ${infoRow('Status', statusBadge('Awaiting Approval', '#b45309', '#fffbeb'))}
      </table>
      <div style="margin-top:24px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
        <p style="margin:0;font-size:13px;color:#92400e;">⏳ Please review and approve or reject this request in the admin panel.</p>
      </div>`,
  });
}

// User: boarding confirmed
async function sendBoardingConfirmation({ userEmail, userName, petName, startDate, endDate, totalDays }) {
  await sendEmail({
    to: userEmail,
    subject: `✅ Boarding Request Received — ${petName}`,
    title: `Booking Confirmed, ${userName}!`,
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Your boarding request has been submitted. We'll review it and get back to you within 24 hours.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Pet', petName)}
        ${infoRow('Check-in', startDate)}
        ${infoRow('Check-out', endDate)}
        ${infoRow('Duration', `${totalDays} night${totalDays !== 1 ? 's' : ''}`)}
        ${infoRow('Status', statusBadge('Pending Review', '#b45309', '#fffbeb'))}
      </table>`,
  });
}

// User: boarding approved
async function sendBoardingApproved({ userEmail, userName, petName, startDate, endDate }) {
  await sendEmail({
    to: userEmail,
    subject: `🎉 Boarding Approved — ${petName}`,
    title: `Great news, ${userName}!`,
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Your boarding request has been approved. We can't wait to take care of ${petName}!</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Pet', petName)}
        ${infoRow('Check-in', startDate)}
        ${infoRow('Check-out', endDate)}
        ${infoRow('Status', statusBadge('Approved', '#15803d', '#f0fdf4'))}
      </table>
      <div style="margin-top:24px;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
        <p style="margin:0;font-size:13px;color:#065f46;">🐾 Please arrive on time on your check-in date. Contact us if you need any adjustments.</p>
      </div>`,
  });
}

// User: boarding rejected
async function sendBoardingRejected({ userEmail, userName, petName }) {
  await sendEmail({
    to: userEmail,
    subject: `❌ Boarding Request Update — ${petName}`,
    title: `Update on Your Booking`,
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Hi ${userName}, unfortunately we are unable to accommodate your boarding request for ${petName} at this time.</p>
      <div style="padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
        <p style="margin:0;font-size:13px;color:#991b1b;">We apologize for the inconvenience. Please contact us or try booking for different dates.</p>
      </div>`,
  });
}

// Admin: new grooming booking
async function sendGroomingBookedAdmin({ adminEmail, userName, petName, serviceType, slotDate, slotTime }) {
  const serviceLabels = { bath: 'Bath Only', haircut: 'Haircut Only', bath_haircut: 'Bath + Haircut' };
  await sendEmail({
    to: adminEmail,
    subject: `✂️ New Grooming Booking — ${petName}`,
    title: 'New Grooming Appointment',
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">A new grooming appointment has been booked.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Customer', userName)}
        ${infoRow('Pet', petName)}
        ${infoRow('Service', serviceLabels[serviceType] || serviceType)}
        ${infoRow('Date', slotDate)}
        ${infoRow('Time', slotTime)}
        ${infoRow('Status', statusBadge('Confirmed', '#15803d', '#f0fdf4'))}
      </table>`,
  });
}

// User: grooming confirmation
async function sendGroomingConfirmation({ userEmail, userName, petName, serviceType, slotDate, slotTime }) {
  const serviceLabels = { bath: 'Bath Only', haircut: 'Haircut Only', bath_haircut: 'Bath + Haircut' };
  await sendEmail({
    to: userEmail,
    subject: `✂️ Grooming Appointment Confirmed — ${petName}`,
    title: `You're all set, ${userName}!`,
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Your grooming appointment has been confirmed. We look forward to seeing ${petName}!</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Pet', petName)}
        ${infoRow('Service', serviceLabels[serviceType] || serviceType)}
        ${infoRow('Date', slotDate)}
        ${infoRow('Time', slotTime)}
        ${infoRow('Status', statusBadge('Confirmed', '#15803d', '#f0fdf4'))}
      </table>
      <div style="margin-top:24px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
        <p style="margin:0;font-size:13px;color:#92400e;">⏰ Please arrive 5 minutes before your appointment time.</p>
      </div>`,
  });
}

// Admin: grooming cancelled
async function sendGroomingCancelledAdmin({ adminEmail, userName, petName, slotDate, slotTime }) {
  await sendEmail({
    to: adminEmail,
    subject: `❌ Grooming Cancelled — ${petName}`,
    title: 'Grooming Appointment Cancelled',
    bodyHtml: `
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">A grooming appointment has been cancelled by the customer.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;">
        ${infoRow('Customer', userName)}
        ${infoRow('Pet', petName)}
        ${infoRow('Date', slotDate)}
        ${infoRow('Time', slotTime)}
        ${infoRow('Status', statusBadge('Cancelled', '#dc2626', '#fef2f2'))}
      </table>`,
  });
}

module.exports = {
  sendBoardingRequestedAdmin,
  sendBoardingConfirmation,
  sendBoardingApproved,
  sendBoardingRejected,
  sendGroomingBookedAdmin,
  sendGroomingConfirmation,
  sendGroomingCancelledAdmin,
};
