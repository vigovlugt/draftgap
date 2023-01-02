import { JSX } from "solid-js/jsx-runtime";

export function Button(
    props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: JSX.Element;
        theme: "primary" | "secondary";
    }
) {
    const themeClasses = {
        primary: "bg-white border-0 text-primary  hover:bg-neutral-200",
        secondary:
            "text-neutral-300 border-neutral-700 bg-primary hover:bg-neutral-800",
    };

    return (
        <button
            type="button"
            class="uppercase text-2xl relative inline-flex items-center border px-4 py-1 font-medium focus:z-10 rounded-md"
            classList={{
                [themeClasses[props.theme]]: true,
            }}
            {...props}
        >
            {props.children}
        </button>
    );
}
