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
            },
        },
    },
    plugins: [],
};
