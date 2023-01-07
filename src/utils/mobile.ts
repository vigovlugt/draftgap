export const setupMobileVH = () => {
    const setProp = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    window.addEventListener("resize", () => setProp());
    setProp();
};
