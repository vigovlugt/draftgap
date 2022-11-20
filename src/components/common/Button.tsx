import { JSX } from "solid-js/jsx-runtime";

export function Button(
    props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: JSX.Element;
    }
) {
    return (
        <button
            type="button"
            class="text-2xl relative inline-flex items-center border text-neutral-300 border-neutral-700 bg-primary px-3 py-1 font-medium hover:bg-neutral-800 focus:z-10 rounded-md"
        >
            {props.children}
        </button>
    );
}
