"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EventContainer from "./eventContainer";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Phone } from "lucide-react";
import Flower from "./flower";
import { Nanum_Myeongjo } from "next/font/google";

const fontNanumMyeongjo = Nanum_Myeongjo({
    variable: "--font-nanum-myeongjo",
    weight: "700",
    subsets: ["latin"],
});

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

    // Function to trigger confetti
    const throwConfetti = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const buttonCenter = {
            x: (rect.left + rect.right) / 2 / window.innerWidth,
            y: (rect.top + rect.bottom) / 2 / window.innerHeight
        };

        const confetti = (await import('canvas-confetti')).default;
        confetti({
            particleCount: 150,
            spread: 180,
            origin: buttonCenter,
            //colors: ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80']
            colors: [
                '#166534', // dark green
                '#15803d', // medium green
                '#16a34a', // light green
                '#fbbf24', // warm yellow
                '#f59e0b', // golden yellow
                '#4ade80'  // deep gold
            ]
        });
    };

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
            event: "London",
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
            event: "Istanbul",
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
            event: "Seoul",
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
        <div className="flex flex-col text-green-800 min-h-screen bg-gradient-to-b from-background to-foreground/5 overflow-x-hidden" key={`home-root-${locale}`}>
            {/* Navigation */}
            <nav className="px-4 py-4 fixed top-2 z-10 flex flex-row justify-center w-full">
                <Image src="/small-flowers.png" alt="Flower decoration" width={40} height={40} className="mr-2 rotate-180" />
                <LanguageSwitcher />
                <Image src="/small-flowers.png" alt="Flower decoration" width={40} height={40} className="ml-2" />
            </nav>

            {/* Hero Section */}
            <motion.section
                className="pt-24 lg:pt-32 pb-20 px-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                key={`hero-${locale}`}
            >
                <div className="container mx-auto flex flex-col gap-8">
                    <Image
                        src="/hero.png"
                        alt="Wedding hero image"
                        width={1200}
                        height={600}
                        className="w-full lg:w-4/6 max-w-screen-lg mx-auto"
                        priority
                    />
                    <div className="flex flex-col gap-2">
                        <motion.h1
                            className="text-4xl lg:text-7xl font-bold whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {t('title')}
                        </motion.h1>
                        <motion.div
                            className="text-xl lg:text-5xl leading-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            dangerouslySetInnerHTML={{ __html: t('description') }}
                        />
                        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 w-auto mx-auto text-xl lg:text-4xl items-center">
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('london')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}>
                                {nav('london')}
                            </motion.span>
                            <span className="w-1 h-1 lg:w-2 lg:h-2 rounded-full bg-green-800"></span>
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('istanbul')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}>
                                {nav('istanbul')}
                            </motion.span>
                            <span className="w-1 h-1 lg:w-2 lg:h-2 rounded-full bg-green-800"></span>
                            <motion.span
                                className="cursor-pointer transition-colors"
                                onClick={() => scrollTo('seoul')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}>
                                {nav('seoul')}
                            </motion.span>
                        </div>
                        <motion.button
                            className="mt-4 mx-auto px-12 py-3 cursor-pointer text-xl lg:text-2xl bg-green-950 text-green-200 rounded-md hover:bg-green-900 transition-colors"
                            onClick={throwConfetti}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            {t('celebrate')} <Image src="/flower-medium.png" alt="Flower decoration" width={40} height={40} className="w-10 ml-2 inline-block" />
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            {/* Info Cards */}
            <section id="celebrations" className="py-8 lg:py-16 px-4 w-full flex flex-row justify-center relative container mx-auto overflow-hidden">
                <div className="flex flex-col gap-6 lg:gap-12 w-full">
                    {celebrations.map((celebration, index) => (
                        <div key={index} className="flex flex-col items-center gap-6 lg:gap-12 w-full max-w-[1000px] mx-auto">
                            <EventContainer key={index} {...celebration} />
                            {index !== celebrations.length - 1 && <Image src="/flower-medium.png" alt="Flower decoration" width={120} height={120} className="flex lg:hidden rotate-12 z-10 w-[120px] pointer-events-none" />}
                        </div>
                    ))}
                </div>
            </section>

            {locale === 'ko' && (
                <>


                    {/* Contact Host */}
                    <section id="contact_host" className="px-4 w-full container mx-auto max-w-[680px] mt-8">
                        <div className="bg-green-900 border-2 border-green-950 rounded-lg shadow-lg py-4 px-2 flex flex-col items-center gap-4 justify-between text-white relative overflow-hidden">
                            <div className="text-xl lg:text-3xl">
                                혼주에게 연락하기
                            </div>
                            <div className="flex flex-row lg:flex-row items-center gap-4 lg:gap-8">
                                <span className="text-xl lg:text-2xl">신부 측 혼주</span>
                                <ul className="flex flex-col gap-3">
                                    <li className="flex flex-row  gap-2 items-center">
                                        <span className="text-xl lg:text-2xl min-w-[80px] lg:min-w-[100px]"><span className="opacity-50">아버지</span> 하종학</span>
                                        <div className="flex flex-row gap-2 lg:gap-2">
                                            <a href="tel:+8201053586212" className="flex items-center justify-center border border-white rounded-full p-2 lg:p-3 hover:bg-white/10 transition-colors">
                                                <Phone size={14} />
                                            </a>
                                            <a href="https://open.kakao.com/o/sJ1xeUNc" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center border border-white rounded-full p-2 lg:p-3 hover:bg-white/10 transition-colors">
                                                <MessageCircle size={14} className="relative -top-[1px] left-[1px]" />
                                            </a>
                                        </div>
                                    </li>
                                    <li className="flex flex-row gap-2 items-center">
                                        <span className="text-xl lg:text-2xl min-w-[80px] lg:min-w-[100px]"><span className="text-white/50">어머니</span> 권순옥</span>
                                        <div className="flex flex-row gap-2 lg:gap-2">
                                            <a href="tel:+8201063546212" className="flex items-center justify-center border border-white rounded-full p-2 lg:p-3 hover:bg-white/10 transition-colors">
                                                <Phone size={14} />
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <Flower className="absolute -right-2 -top-2 lg:-right-4 lg:-top-3 flex rotate-180 z-10 w-[60px] lg:w-[120px] pointer-events-none" />
                            <Flower className="absolute -left-2 -bottom-1 lg:-left-4 lg:-bottom-3 flex z-10 w-[60px] lg:w-[120px] pointer-events-none" />
                        </div>
                    </section>


                    <span className="text-xl lg:text-2xl text-center mt-8 leading-tight">결혼식에 참석하실 분은 
                                    참석여부를 알려주시면  <br/>
                                    예식장 지정좌석 배정관계로  <br/>
                                    참석의사를 전달해주시면 
                                    감사하겠습니다
                            </span>

                    {/* Family Bank */}
                    <section id="family_bank" className="font-nanum px-4 w-full container mx-auto max-w-[680px] mt-8">
                        <div className="bg-white/60 border-2 border-green-900 text-green-900 rounded-lg shadow-lg py-8 px-2 flex flex-col items-center gap-2 justify-between relative overflow-hidden">
                            <span className="text-lg lg:text-2xl text-center">
                                신랑신부에게 따뜻한 축하의 말을 전해주세요.<br /> 아래 계좌로 선물을 보내주시며 축복을 나눠주세요.
                            </span>
                            <ul className="flex flex-col gap-0 mt-2 items-center justify-center text-lg lg:text-xl">
                                <li className="flex flex-row gap-2 items-center justify-center">
                                    <span>하종학:</span>
                                    <span>농협은행</span>
                                    <span className={`text-sm tracking-tighter ${fontNanumMyeongjo.className}`}>084-02-179986</span>
                                </li>
                                <li className="flex flex-row gap-2 items-center justify-center">
                                    <span>권순옥:</span>
                                    <span>국민은행</span>
                                    <span className={`text-sm tracking-tighter ${fontNanumMyeongjo.className}`}>762-24-0049730</span>
                                </li>
                            </ul>
                            <Flower className="absolute -right-2 -top-2 lg:-right-4 lg:-top-3 flex rotate-180 z-10 w-[60px] lg:w-[120px] pointer-events-none" />
                            <Flower className="absolute -left-2 -bottom-1 lg:-left-4 lg:-bottom-3 flex z-10 w-[60px] lg:w-[120px] pointer-events-none" />
                        </div>
                    </section>
                </>
            )}

            {/* Contact Form */}
            <section id="contact" className="max-w-screen-sm py-16 px-4 w-full flex flex-row justify-center relative container mx-auto">
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-4xl font-bold leading-none">{contact('title')}</h2>
                    <p className="text-2xl leading-none">{contact('description')}</p>

                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="text-2xl flex flex-col gap-4">
                            <div className="flex flex-col gap-0">
                                <label className="leading-none" htmlFor="name">{contact('form.name')}</label>
                                <input className="bg-[var(--background)] text-green-800 border-2 border-green-800 px-4 py-2 rounded-md w-full" type="text" id="name" name="name" required />
                            </div>
                            <div className="flex flex-col gap-0">
                                <label className="leading-none" htmlFor="email">{contact('form.email')}</label>
                                <input className="bg-[var(--background)] text-green-800 border-2 border-green-800 px-4 py-2 rounded-md w-full" type="email" id="email" name="email" required />
                            </div>
                            <div className="flex flex-col gap-0">
                                <label className="leading-none" htmlFor="message">{contact('form.message')}</label>
                                <textarea rows={5} className="bg-[var(--background)] text-green-800 border-2 border-green-800 px-4 py-2 rounded-md w-full" id="message" name="message" required />
                            </div>

                            {submitResult && (
                                <div className={`p-4 my-4 text-2xl rounded-md ${submitResult.success
                                    ? 'bg-green-800 text-green-200'
                                    : 'bg-red-900 text-red-200'}`}>
                                    {submitResult.message}
                                </div>
                            )}

                            <button
                                className={`mt-4 px-4 py-2 cursor-pointer rounded-md flex items-center justify-center transition-colors ${isSubmitting
                                    ? 'bg-green-800/25 text-green-200 cursor-not-allowed'
                                    : 'bg-green-950 text-green-200 hover:bg-green-900'}`}
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
            <footer className="py-6 bg-green-950 backdrop-blur-sm mt-32">
                <div className="container mx-auto text-center">
                    <p className="text-green-200">{footer('copyright')}</p>
                </div>
            </footer>
        </div>
    );
} 