const nodemailer = require("nodemailer");

const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter || !to) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

const sendBookingConfirmation = (booking) =>
  sendEmail({
    to: booking.user.email,
    subject: `Booking confirmed: ${booking.event.title}`,
    text: `Your booking ${booking._id} for ${booking.event.title} is confirmed. Seats: ${booking.seats}.`,
  });

const sendCancellation = (booking) =>
  sendEmail({
    to: booking.user.email,
    subject: `Booking cancelled: ${booking.event.title}`,
    text: `Your booking ${booking._id} for ${booking.event.title} has been cancelled.`,
  });

const sendWaitlistNotice = (entry) =>
  sendEmail({
    to: entry.user.email,
    subject: `A seat is available: ${entry.event.title}`,
    text: `A seat is now available for ${entry.event.title}. Please return to CampusEvents to complete your booking.`,
  });

module.exports = { sendBookingConfirmation, sendCancellation, sendWaitlistNotice };
