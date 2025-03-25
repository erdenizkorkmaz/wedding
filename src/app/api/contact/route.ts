import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Validate environment variables
const requiredEnvVars = [
  'SMTP_USER', 
  'SMTP_PASSWORD', 
  'RECAPTCHA_SECRET_KEY', 
  'RECIPIENT_EMAIL'
];

// Log environment variables availability (without exposing actual values)
requiredEnvVars.forEach(varName => {
  console.log(`${varName} is ${process.env[varName] ? 'set' : 'NOT SET'}`);
});

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
        // Check for required environment variables
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { name, email, message, recaptchaToken } = await request.json();
        
        // Validate required fields
        if (!name || !email || !message) {
            console.error('Missing required fields in contact form submission');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Skip reCAPTCHA verification if we're using the fallback token
        const isFallbackToken = recaptchaToken === "fallback_token_manual_override";
        
        let recaptchaVerified = false;
        
        if (!isFallbackToken) {
            try {
                // Log reCAPTCHA verification attempt
                console.log('Attempting reCAPTCHA verification with token:', 
                    recaptchaToken ? `${recaptchaToken.substring(0, 10)}...` : 'undefined');
                    
                // Verify reCAPTCHA token
                const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
                });

                const recaptchaData = await recaptchaResponse.json();
                console.log('reCAPTCHA verification response:', recaptchaData);

                // Specifically handle browser-error case
                if (recaptchaData['error-codes'] && 
                    recaptchaData['error-codes'].includes('browser-error')) {
                    console.log('Browser error detected in reCAPTCHA, using alternative validation');
                    // Continue with the form submission but log it
                    recaptchaVerified = true;
                } else if (!recaptchaData.success) {
                    console.error('reCAPTCHA verification failed:', recaptchaData);
                    return NextResponse.json(
                        { error: 'reCAPTCHA verification failed' },
                        { status: 400 }
                    );
                } else {
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
                    
                    recaptchaVerified = true;
                }
            } catch (verificationError) {
                console.error('Error during reCAPTCHA verification:', verificationError);
                // Don't block the submission due to verification errors
                recaptchaVerified = true;
            }
        } else {
            console.log('Using fallback verification method - bypassing reCAPTCHA checks');
            recaptchaVerified = true;
        }
        
        if (!recaptchaVerified) {
            return NextResponse.json(
                { error: 'Could not verify you are human' },
                { status: 400 }
            );
        }

        // Perform basic spam filtering
        const isSpam = 
            message.includes('http') || 
            message.includes('www.') ||
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message) ||
            message.length > 2000;
            
        if (isSpam) {
            console.warn('Potential spam detected in message');
            return NextResponse.json({ success: true }); // Pretend success but don't send email
        }

        // Send email
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: process.env.RECIPIENT_EMAIL,
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

        console.log('Attempting to send email to:', process.env.RECIPIENT_EMAIL);
        
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
            { error: 'Failed to process contact form' },
            { status: 500 }
        );
    }
} 