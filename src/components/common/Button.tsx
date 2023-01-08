import { DynamicProps } from "solid-headless/dist/types/utils/dynamic-prop";
import { splitProps, ValidComponent } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

export function Button<T extends ValidComponent>(
    props: DynamicProps<T> & {
        children?: JSX.Element;
        as?: T;
        theme: "primary" | "secondary";
    }
) {
    const [local, other] = splitProps(props, ["children", "as", "theme"]);
    const themeClasses = {
        primary: "bg-white border-0 text-primary  hover:bg-neutral-200",
        secondary:
            "text-neutral-300 border-neutral-700 bg-primary hover:bg-neutral-800",
    };

    return (
        <Dynamic
            component={local.as || "button"}
            {...other}
            class={`uppercase text-xl relative inline-flex items-center border px-4 py-1 font-medium focus:z-10 rounded-md ${
                themeClasses[local.theme]
            } ${props.class}`}
        >
            {props.children}
        </Dynamic>
    );
}
