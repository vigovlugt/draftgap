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
        },
    },
    plugins: [],
};
