"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EventContainer from "./eventContainer";
import { useEffect, useState } from "react";

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

interface HomeClientProps {
    locale: string;
}

export default function HomeClient({ locale }: HomeClientProps) {
    // Force a fresh instance of translations hook for each locale
    const t = useTranslations('home');
    const nav = useTranslations('navigation');
    const footer = useTranslations('footer');
    const contact = useTranslations('contact');

    // Add loading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success?: boolean; message?: string } | null>(null);

    useEffect(() => {
        console.log('reCAPTCHA Site Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

        if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
            console.error('reCAPTCHA site key is missing. Please check your .env.local file.');
            return;
        }

        // First verify we can connect to Google's domain with a simple request
        fetch('https://www.google.com/recaptcha/api.js', {
            method: 'HEAD',
            mode: 'no-cors' // Just checking connectivity
        })
            .then(() => {
                console.log('Network connection to Google reCAPTCHA available');
                loadRecaptchaScript();
            })
            .catch(networkError => {
                console.error('Cannot connect to Google reCAPTCHA servers:', networkError);
            });

        function loadRecaptchaScript() {
            // Load reCAPTCHA v3 script
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('reCAPTCHA script loaded successfully');
            };

            script.onerror = (error) => {
                console.error('Error loading reCAPTCHA script. This could be due to:');
                console.error('1. Incorrect site key');
                console.error('2. Network issues');
                console.error('3. Content Security Policy blocking the script');
                console.error('Error details:', error);

                // Try directly logging the site key for verification (don't do this in production)
                console.log('Current site key for verification:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
            };

            document.head.appendChild(script);
        }

        return () => {
            // Remove script safely
            const scripts = document.head.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].src.includes('recaptcha')) {
                    try {
                        scripts[i].parentNode?.removeChild(scripts[i]);
                        console.log('reCAPTCHA script removed');
                        break;
                    } catch (error) {
                        console.error('Error removing reCAPTCHA script:', error);
                    }
                }
            }
        };
    }, []);

    const executeRecaptcha = async () => {
        try {
            // Wait for grecaptcha to be defined with timeout
            const waitForGrecaptcha = async (timeout = 3000) => {
                const startTime = Date.now();
                while (!window.grecaptcha) {
                    if (Date.now() - startTime > timeout) {
                        console.log('Timed out waiting for reCAPTCHA to load, using fallback');
                        return false;
                    }
                    // Wait 100ms before checking again
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log('grecaptcha is available now');
                return true;
            };

            const recaptchaLoaded = await waitForGrecaptcha();
            if (!recaptchaLoaded) {
                console.log('Using fallback token because reCAPTCHA failed to load');
                return "fallback_token_manual_override";
            }

            if (!window.grecaptcha || !window.grecaptcha.ready) {
                console.error('reCAPTCHA not initialized properly');
                return "fallback_token_manual_override";
            }

            // Wait for reCAPTCHA to be ready with timeout
            let recaptchaReady = false;
            try {
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('reCAPTCHA ready timeout'));
                    }, 3000);

                    window.grecaptcha.ready(() => {
                        clearTimeout(timeout);
                        recaptchaReady = true;
                        console.log('reCAPTCHA is ready for execution');
                        resolve();
                    });
                });
            } catch (readyError) {
                console.error('Error waiting for reCAPTCHA to be ready:', readyError);
                return "fallback_token_manual_override";
            }

            if (!recaptchaReady) {
                console.error('reCAPTCHA not ready after timeout');
                return "fallback_token_manual_override";
            }

            if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
                console.error('reCAPTCHA site key is missing');
                return "fallback_token_manual_override";
            }

            try {
                console.log('Executing reCAPTCHA with site key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
                const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
                    action: 'contact_form'
                });

                if (!token) {
                    console.error('Empty token received from reCAPTCHA');
                    return "fallback_token_manual_override";
                }

                console.log('Got reCAPTCHA token:', token.substring(0, 10) + '...');
                return token;
            } catch (executeError) {
                console.error('Error executing reCAPTCHA:', executeError);
                return "fallback_token_manual_override";
            }
        } catch (error) {
            console.error('Error in reCAPTCHA process:', error);
            return "fallback_token_manual_override";
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset previous results
        setSubmitResult(null);
        setIsSubmitting(true);

        try {
            // Execute reCAPTCHA before submitting
            const token = await executeRecaptcha();

            if (!token) {
                setSubmitResult({
                    success: false,
                    message: 'Could not verify you are human. Please try again later or contact us directly.'
                });
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Validate required fields
            if (!name || !email || !message) {
                setSubmitResult({
                    success: false,
                    message: 'Please fill in all required fields'
                });
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message, recaptchaToken: token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Network response was not ok');
            }

            console.log('Email sent successfully:', data);
            setSubmitResult({
                success: true,
                message: 'Thank you for your message! We will get back to you soon.'
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error sending email:', error);
            setSubmitResult({
                success: false,
                message: 'There was an error sending your message. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'contact') {
                window.scrollTo({
                    top: element.offsetTop - 20,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo({
                    top: element.offsetTop + element.offsetHeight,
                    behavior: 'smooth'
                });
            }
        }
    }

    const celebrations = [
        {
            title: t('celebrations.UK.title'),
            date: t('celebrations.UK.date'),
            location: t('celebrations.UK.location'),
            descriptionTitle: t('celebrations.UK.descriptionTitle'),
            description1: t('celebrations.UK.description1'),
            description2: t('celebrations.UK.description2'),
            description3: t('celebrations.UK.description3'),
            description4: t('celebrations.UK.description4'),
            map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.409655370034!2d-0.1710957221952322!3d51.48734957180888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876056c2150cfa7%3A0xe0b00e43b3c6998!2sChelsea%20Old%20Town%20Hall!5e0!3m2!1sen!2suk!4v1742837365998!5m2!1sen!2suk"
        },
        {
            title: t('celebrations.TR.title'),
            date: t('celebrations.TR.date'),
            location: t('celebrations.TR.location'),
            descriptionTitle: t('celebrations.TR.descriptionTitle'),
            description1: t('celebrations.TR.description1'),
            description2: t('celebrations.TR.description2'),
            description3: t('celebrations.TR.description3'),
            map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.2362249398066!2d28.99280807658783!3d41.04196297134587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab72d8bdbf649%3A0x5e09db9b67067c74!2sSVADBA%20MACKA!5e0!3m2!1sen!2suk!4v1742837318666!5m2!1sen!2suk"
        },
        {
            title: t('celebrations.KO.title'),
            date: t('celebrations.KO.date'),
            location: t('celebrations.KO.location'),
            descriptionTitle: t('celebrations.KO.descriptionTitle'),
            description1: t('celebrations.KO.description1'),
            description2: t('celebrations.KO.description2'),
            description3: t('celebrations.KO.description3'),
            description4: t('celebrations.KO.description4'),
            map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.7818094134354!2d126.9947198!3d37.56020409999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca29433662bd7%3A0x540c2f813a78c49e!2sKorea%20House!5e0!3m2!1sen!2suk!4v1742837248405!5m2!1sen!2suk"
        }
    ]

    // Use a completely unique component key for each locale to force complete remount
    return (
        <div className="flex flex-col text-green-800 min-h-screen bg-gradient-to-b from-background to-foreground/5" key={`home-root-${locale}`}>
            {/* Navigation */}
            <nav className="px-4 py-4 bg-background/80 fixed top-0 left-1/2 -translate-x-1/2 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <img src="/small-flowers.png" className="w-10 h-10 mr-2 rotate-180" />
                    <LanguageSwitcher />
                    <img src="/small-flowers.png" className="w-10 h-10 ml-2" />
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                className="pt-32 pb-20 px-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                key={`hero-${locale}`}
            >
                <div className="container mx-auto flex flex-col gap-8">
                    <img src="/hero.png" className="w-full max-w-screen-lg mx-auto" />
                    <div className="flex flex-col gap-2 lg:gap-2">
                        <motion.h1
                            className="text-4xl lg:text-7xl font-bold whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {t('title')}
                        </motion.h1>
                        <motion.p
                            className="text-2xl lg:text-4xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {t('description')}
                        </motion.p>
                        <div className="flex flex-row gap-4 w-auto mx-auto text-2xl lg:text-4xl items-center">
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('london')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}>
                                {nav('london')}
                            </motion.span>
                            <span className="w-2 h-2 rounded-full bg-green-800"></span>
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('istanbul')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}>
                                {nav('istanbul')}
                            </motion.span>
                            <span className="w-2 h-2 rounded-full bg-green-800"></span>
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('seoul')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}>
                                {nav('seoul')}
                            </motion.span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Info Cards */}
            <section id="celebrations" className="py-8 lg:py-16 px-4 w-full flex flex-row justify-center relative container mx-auto">
                <div className="flex flex-col gap-6 lg:gap-12 w-full">
                    {celebrations.map((celebration, index) => (
                        <div key={index} className="flex flex-col items-center gap-6 lg:gap-12">
                            <EventContainer key={index} {...celebration} />
                            {index !== celebrations.length - 1 && <img src="/flower-medium.png" className="flex lg:hidden rotate-12 z-10 w-[120px] pointer-events-none" />}
                        </div>
                    ))}
                </div>
            </section>

            <section id="contact" className="max-w-screen-sm py-16 px-4 w-full flex flex-row justify-center relative container mx-auto">
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-4xl font-bold">{contact('title')}</h2>
                    <p className="text-2xl">{contact('description')}</p>

                    {submitResult && (
                        <div className={`p-4 my-4 text-2xl rounded-md ${submitResult.success
                            ? 'bg-green-800 text-green-200'
                            : 'bg-red-900 text-red-200'}`}>
                            {submitResult.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="text-3xl flex flex-col gap-4">
                            <label htmlFor="name">{contact('form.name')}</label>
                            <input className="bg-[var(--background)] text-green-800 border-2 border-foreground px-4 py-2 rounded-md" type="text" id="name" name="name" required />
                            <label htmlFor="email">{contact('form.email')}</label>
                            <input className="bg-[var(--background)] text-green-800 border-2 border-green-800 px-4 py-2 rounded-md" type="email" id="email" name="email" required />
                            <label htmlFor="message">{contact('form.message')}</label>
                            <textarea rows={5} className="bg-[var(--background)] text-green-800 border-2 border-green-800 px-4 py-2 rounded-md" id="message" name="message" required />
                            <button
                                className={`mt-8 px-4 py-2 rounded-md flex items-center justify-center transition-colors ${isSubmitting
                                    ? 'bg-green-800/25 text-green-200 cursor-not-allowed'
                                    : 'bg-green-800 text-green-200 hover:bg-green-900'}`}
                                type="submit"
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {contact('form.sending')}
                                    </span>
                                ) : contact('form.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 bg-green-800 backdrop-blur-sm mt-32">
                <div className="container mx-auto text-center">
                    <p className="text-[var(--background)]">{footer('copyright')}</p>
                </div>
            </footer>
        </div>
    );
} 