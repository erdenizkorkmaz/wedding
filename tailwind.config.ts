import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                nanum: ["var(--font-nanum-brush-script)"],
                reenie: ["var(--font-reenie-beanie)"],
            },
        },
    },
    plugins: [],
};
export default config; 