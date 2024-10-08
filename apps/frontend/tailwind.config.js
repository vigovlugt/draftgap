import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#191919",
                secondary: "#d6b598",
                tertiary: "#FFD700",
                background: "#eeeeee",
                text: "#f4f4f4",
                ally: "#3b82f6",
                opponent: "#ef4444",
                winrate: {
                    shiggo: "#ff4e50",
                    meh: "#fcb1b2",
                    okay: colors.neutral[50],
                    good: "#7ea4f4",
                    great: "#3273fa",
                    volxd: "#ff9b00",
                },
            },
            fontFamily: {
                header: ["'Oswald'", "sans-serif"],
                body: [
                    "'OpenSans'",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Oxygen",
                    "Ubuntu",
                    "Cantarell",
                    "Fira Sans",
                    "Droid Sans",
                    "Helvetica Neue",
                    "sans-serif",
                ],
            },
            animation: {
                enter: "enter 0.15s ease-out",
                leave: "leave 0.1s ease-in forwards",
                "dialog-enter": "enter 0.3s ease-out",
                "dialog-leave": "leave 0.2s ease-in forwards",
            },
            keyframes: {
                enter: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                leave: {
                    "100%": { transform: "scale(0.95)", opacity: "0" },
                    "0%": { transform: "scale(1)", opacity: "1" },
                },
            },
        },
    },
    plugins: [require("@kobalte/tailwindcss")],
};
