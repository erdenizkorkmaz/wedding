import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
    try {
        const { name, email, message, recaptchaToken } = await request.json();

        // Verify reCAPTCHA token
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        });

        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
            return NextResponse.json(
                { error: 'reCAPTCHA verification failed' },
                { status: 400 }
            );
        }

        // Send email
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: process.env.RECIPIENT_EMAIL, // The email where you want to receive contact form submissions
          cc: process.env.CC_EMAIL,
            subject: `Wedding Message from ${name}`,
            text: `
              Name: ${name}
              Email: ${email}
              
              Message:
              ${message}
            `,
            html: `
              <h2>Wedding Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <h3>Message:</h3>
              <p>${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
            { error: 'Failed to process contact form' },
            { status: 500 }
        );
    }
} 