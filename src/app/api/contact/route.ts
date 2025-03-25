import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function POST(request: Request) {
    try {
        const { name, email, message, recaptchaToken } = await request.json();

        // Skip reCAPTCHA verification if we're using the fallback token
        const isFallbackToken = recaptchaToken === "fallback_token_manual_override";
        
        if (!isFallbackToken) {
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
                console.error('reCAPTCHA verification failed:', recaptchaData);
                return NextResponse.json(
                    { error: 'reCAPTCHA verification failed' },
                    { status: 400 }
                );
            }

            // Check reCAPTCHA score (0.0 to 1.0)
            if (recaptchaData.score < 0.5) {
                console.log('Low reCAPTCHA score:', recaptchaData.score);
                return NextResponse.json(
                    { error: 'reCAPTCHA score too low' },
                    { status: 400 }
                );
            }

            // Verify action matches
            if (recaptchaData.action !== 'contact_form') {
                return NextResponse.json(
                    { error: 'Invalid reCAPTCHA action' },
                    { status: 400 }
                );
            }
        } else {
            console.log('Using fallback verification method - bypassing reCAPTCHA checks');
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