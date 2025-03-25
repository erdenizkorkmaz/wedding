import { motion } from "framer-motion";

interface EventContainerProps {
    title: string;
    date: string;
    location: string;
    descriptionTitle: string;
    description1: string;
    description2: string;
    description3: string;
    description4?: string;
    map: string;
}

export default function EventContainer(props: EventContainerProps) {
    // Function to create calendar event
    const addToCalendar = () => {
        // Format for Google Calendar link
        const encodedLocation = encodeURIComponent(props.location);
        const encodedTitle = encodeURIComponent(`${props.title} - Hyejin & Erdeniz Wedding`);

        // Create description with timeline
        let description = `${props.descriptionTitle}:\n${props.description1}\n${props.description2}\n${props.description3}`;
        if (props.description4) {
            description += `\n${props.description4}`;
        }
        const encodedDescription = encodeURIComponent(description);

        // Parse the date
        const dateParts = props.date.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)\s+(\d+)/);

        if (!dateParts) {
            console.error('Could not parse date:', props.date);
            return;
        }

        const day = dateParts[1].padStart(2, '0');
        const month = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        }[dateParts[2]] || '01';
        const year = dateParts[3];

        // Set default times (start at noon, end at 3pm)
        const startDate = `${year}${month}${day}T120000`;
        const endDate = `${year}${month}${day}T150000`;

        // Create Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startDate}/${endDate}&details=${encodedDescription}&location=${encodedLocation}&sf=true&output=xml`;

        // Open in new tab
        window.open(googleCalendarUrl, '_blank');
    };

    return (
        <motion.div
            id={props.title.toLowerCase()}
            className="relative flex flex-col w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.6 }}
        >
            <img src="/flower-medium-vertical.png" className="hidden lg:flex absolute -left-8 rotate-12 z-10 h-full pointer-events-none" />
            <div className="bg-white/60 rounded-lg shadow-lg lg:ml-20 lg:pl-28 p-6 lg:p-8 flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex flex-col w-full lg:w-1/2 text-green-800">
                    <h2 className="text-2xl font-bold lg:mb-2">
                        {props.title} - {props.date}
                    </h2>

                    <button
                        onClick={addToCalendar}
                        className="flex items-center cursor-pointer gap-2 w-fit text-md lg:text-lg text-green-950 hover:text-green-700 transition-colors mb-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="inline relative -top-[2px]">
                            <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z" />
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                        </svg>
                        Add to Calendar
                    </button>

                    <p className="text-green-800 text-xl leading-none lg:text-2xl">{props.location}</p>
                    <b className="mt-3 lg:mt-3 text-xl lg:text-2xl">{props.descriptionTitle}</b>
                    <div className="flex flex-col gap-1 text-xl lg:text-2xl">
                        <p className="text-green-800 leading-none">{props.description1}</p>
                        <p className="text-green-800 leading-none">{props.description2}</p>
                        <p className="text-green-800 leading-none">{props.description3}</p>
                        <p className="text-green-800 leading-none">{props.description4}</p>
                    </div>
                </div>
                <div className="google-maps-container w-full lg:w-1/2 h-[300px] lg:h-auto">
                    <iframe
                        src={props.map}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="max-w-full"
                    ></iframe>
                </div>
            </div>
            <img src="/small-flowers.png" className="h-1/5 lg:h-1/3 hidden lg:flex absolute -bottom-8 -right-8 rotate-12 pointer-events-none" />
        </motion.div>
    );
}