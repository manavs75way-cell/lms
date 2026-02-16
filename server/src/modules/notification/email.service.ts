
import nodemailer from 'nodemailer';
import { env } from '../../config/env';

// Create a transporter
// For dev, we can use Ethereal or just console.log if no creds
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        if (env.NODE_ENV === 'test') return; // Skip in test mode

        const info = await transporter.sendMail({
            from: '"LibrisSync Library" <noreply@library.com>',
            to,
            subject,
            html,
        });

        console.log(`Message sent: ${info.messageId}`);
        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log. Email failure shouldn't crash the app flow.
    }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
    const subject = 'Welcome to LibrisSync!';
    const html = `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining our library. We're excited to have you.</p>
        <p>You can now browse our catalog and borrow books.</p>
    `;
    await sendEmail(to, subject, html);
};

export const sendDueDateReminder = async (to: string, name: string, bookTitle: string, dueDate: Date) => {
    const subject = 'Reminder: Book Due Soon';
    const html = `
        <h1>Hello ${name},</h1>
        <p>This is a reminder that the book <strong>${bookTitle}</strong> is due on <strong>${dueDate.toDateString()}</strong>.</p>
        <p>Please return it on time to avoid fines.</p>
    `;
    await sendEmail(to, subject, html);
};

export const sendOverdueNotice = async (to: string, name: string, bookTitle: string, dueDate: Date, fine: number) => {
    const subject = 'Overdue Notice';
    const html = `
        <h1>Hello ${name},</h1>
        <p>The book <strong>${bookTitle}</strong> was due on <strong>${dueDate.toDateString()}</strong> and is now OVERDUE.</p>
        <p>Current estimated fine: $${fine}</p>
        <p>Please return it immediately.</p>
    `;
    await sendEmail(to, subject, html);
};

export const sendReservationReady = async (to: string, name: string, bookTitle: string) => {
    const subject = 'Good News! Your Book is Available';
    const html = `
        <h1>Hello ${name},</h1>
        <p>The book <strong>${bookTitle}</strong> you reserved is now available!</p>
        <p>It has been automatically borrowed for you. Please come to the library to pick it up.</p>
    `;
    await sendEmail(to, subject, html);
};
