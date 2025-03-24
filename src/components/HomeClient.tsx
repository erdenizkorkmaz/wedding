"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EventContainer from "./eventContainer";

interface HomeClientProps {
    locale: string;
}

export default function HomeClient({ locale }: HomeClientProps) {
    // Force a fresh instance of translations hook for each locale
    const t = useTranslations('home');
    const nav = useTranslations('navigation');
    const footer = useTranslations('footer');
    const contact = useTranslations('contact');

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        const celebrationsSection = document.getElementById('celebrations');
        if (element && celebrationsSection) {
            console.log(element.offsetTop, celebrationsSection.offsetTop, element.offsetTop + celebrationsSection.offsetTop);
            window.scrollTo({
                top: element.offsetTop + celebrationsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(data => {
                console.log('Email sent successfully:', data);
                alert('Thank you for your message! We will get back to you soon.');
                (e.target as HTMLFormElement).reset();
            })
            .catch(error => {
                console.error('Error sending email:', error);
                alert('There was an error sending your message. Please try again later.');
            });
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
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-foreground/5" key={`home-root-${locale}`}>
            {/* Navigation */}
            <nav className="px-4 py-4 bg-background/80 backdrop-blur-sm fixed top-0 right-0 left-0 w-full z-10">
                <div className="container mx-auto flex justify-center items-center">
                    <img src="/small-flowers.png" className="w-10 h-10 mr-2 lg:mr-6 rotate-180" />
                    <div className="flex items-center space-x-2 lg:space-x-6 text-md lg:text-2xl">
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('london')}>{nav('london')}</span>
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('istanbul')}>{nav('istanbul')}</span>
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('seoul')}>{nav('seoul')}</span>
                        <span> - </span>
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('contact')}>{nav('contact')}</span>
                        <span> - </span>
                        <LanguageSwitcher />
                    </div>
                    <img src="/small-flowers.png" className="w-10 h-10 ml-2 lg:ml-6" />
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
                    <div className="flex flex-col gap-2 lg:gap-4">
                        <motion.h1
                            className="text-5xl lg:text-7xl font-bold whitespace-nowrap"
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
                    </div>
                </div>
            </motion.section>

            {/* Info Cards */}
            <section id="celebrations" className="py-8 lg:py-16 px-4 w-full flex flex-row justify-center relative container mx-auto">
                <img src="/flower-line.png" className="flex-1 -mr-16 z-10 hidden lg:flex" />
                <div className="flex flex-col gap-12 w-full">
                    {celebrations.map((celebration, index) => (
                        <EventContainer key={index} {...celebration} />
                    ))}
                </div>
            </section>

            <section id="contact" className="max-w-screen-lg py-16 px-4 w-full flex flex-row justify-center relative container mx-auto">
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-4xl font-bold">{contact('title')}</h2>
                    <p className="text-2xl">{contact('description')}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="text-3xl flex flex-col gap-4">
                            <label htmlFor="name">{contact('form.name')}</label>
                            <input className="bg-[var(--background)] text-[var(--foreground)] border-2 border-foreground px-4 py-2 rounded-md" type="text" id="name" name="name" />
                            <label htmlFor="email">{contact('form.email')}</label>
                            <input className="bg-[var(--background)] text-[var(--foreground)] border-2 border-foreground px-4 py-2 rounded-md" type="email" id="email" name="email" />
                            <label htmlFor="message">{contact('form.message')}</label>
                            <textarea rows={5} className="bg-[var(--background)] text-[var(--foreground)] border-2 border-foreground px-4 py-2 rounded-md" id="message" name="message" />
                            <button className="mt-8 bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md" type="submit">{contact('form.submit')}</button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 bg-[var(--foreground)] backdrop-blur-sm mt-32">
                <div className="container mx-auto text-center">
                    <p className="text-[var(--background)]">{footer('copyright')}</p>
                </div>
            </footer>
        </div>
    );
} 