/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#5B3FE7",
                "primary-dark": "#3C19B0",
                accent: "#11B5A4",
            },
        },
    },
    plugins: [],
};
