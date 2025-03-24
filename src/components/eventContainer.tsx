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
            className="bg-white/40 backdrop-blur-sm pl-8 lg:pl-20 p-8 relative rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            <div className="flex flex-col lg:flex-row gap-4 justify-between w-full">
                <div className="flex flex-col w-full lg:w-1/2">
                    <h2 className="text-3xl font-bold mb-4">{props.title} - {props.date}</h2>
                    <p className="text-foreground text-2xl">{props.location}</p>
                    <b className="mt-3 text-2xl">{props.descriptionTitle}</b>
                    <div className="flex flex-col mt-1 text-2xl">
                        <p className="text-foreground">{props.description1}</p>
                        <p className="text-foreground">{props.description2}</p>
                        <p className="text-foreground">{props.description3}</p>
                        <p className="text-foreground">{props.description4}</p>
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
        </motion.div>
    );
}