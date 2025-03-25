import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventContainerProps {
    event: string;
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


    const googleCalendar = useTranslations('googleCalendar');
    // Function to create calendar event
    const addToCalendar = () => {
        // Format for Google Calendar link
        const encodedLocation = encodeURIComponent(props.location);
        const encodedTitle = encodeURIComponent(`${props.title} - ${googleCalendar("title")}`);

        // Create description with timeline
        let description = `${props.descriptionTitle}:\n${props.description1}\n${props.description2}\n${props.description3}`;
        if (props.description4) {
            description += `\n${props.description4}`;
        }
        const encodedDescription = encodeURIComponent(description);

        // Define dates in the correct format for Google Calendar directly
        // Format: YYYYMMDDTHHMMSS
        let formattedStartDate = "20250427T130000";
        let formattedEndDate = "20250427T190000";

        if (props.event === "Istanbul") {
            formattedStartDate = "20250503T190000";
            formattedEndDate = "20250503T220000";
        }
        if (props.event === "Seoul") {
            formattedStartDate = "20250608T120000";
            formattedEndDate = "20250608T150000";
        }

        // Create Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${formattedStartDate}/${formattedEndDate}&details=${encodedDescription}&location=${encodedLocation}&sf=true&output=xml`;

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

                    <div className="flex flex-row gap-4 justify-between lg:justify-start">
                        <h2 className="text-2xl font-bold lg:mb-2">
                            {props.title} - {props.date}
                        </h2>

                        <button
                            onClick={addToCalendar}
                            title={googleCalendar("add")}
                            className="flex border-green-800 border rounded-full p-2 items-center cursor-pointer gap-2 w-fit text-md lg:text-lg text-green-800 hover:bg-green-800/20  transition-colors mb-2"
                        >
                            <CalendarPlus className="w-4 h-4" />
                        </button>
                    </div>

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