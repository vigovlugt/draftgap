/** @type {import('tailwindcss').Config} */
module.exports = {
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
            },
            fontFamily: {
                header: ["'Oswald'", "sans-serif"],
                body: [
                    "'Montserrat'",
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
                enter: "enter 0.2s ease-out",
                leave: "leave 0.15s ease-in forwards",
            },
            keyframes: {
                enter: {
                    "0%": { transform: "scale(0.9)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                leave: {
                    "100%": { transform: "scale(0.9)", opacity: "0" },
                    "0%": { transform: "scale(1)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
