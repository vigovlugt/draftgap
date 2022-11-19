import { JSX } from "solid-js/jsx-runtime";

export function Button(
    props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: JSX.Element;
    }
) {
    return (
        <button
            type="button"
            class="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
            {props.children}
        </button>
    );
}
