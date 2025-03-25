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
    return (
        <motion.div
            id={props.title.toLowerCase()}
            className="relative flex flex-col w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 1 }}
        >
            <img src="/flower-medium-vertical.png" className="hidden lg:flex absolute -left-4 rotate-12 z-10 h-full pointer-events-none" />
            <div className="bg-white/40 rounded-lg shadow-lg lg:ml-20 lg:pl-28 p-6 lg:p-8 flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex flex-col w-full lg:w-1/2">
                    <h2 className="text-2xl font-bold lg:mb-4">
                        {props.title} - {props.date}
                    </h2>
                    <p className="text-foreground text-xl leading-none lg:text-2xl">{props.location}</p>
                    <b className="mt-3 lg:mt-3 text-xl lg:text-2xl">{props.descriptionTitle}</b>
                    <div className="flex flex-col gap-1 text-xl lg:text-2xl">
                        <p className="text-foreground leading-none">{props.description1}</p>
                        <p className="text-foreground leading-none">{props.description2}</p>
                        <p className="text-foreground leading-none">{props.description3}</p>
                        <p className="text-foreground leading-none">{props.description4}</p>
                    </div>
                </div>
                <div className="google-maps-container w-full lg:w-1/2">
                    <iframe
                        src={props.map}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
            <img src="/small-flowers.png" className="h-1/5 lg:h-1/3 hidden lg:flex absolute -bottom-8 -right-8 rotate-12 pointer-events-none" />
        </motion.div>
    );
}