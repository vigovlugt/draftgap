import { Component, ComponentProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

type BadgeElement = "a" | "button" | "div" | "span";
type Props<T extends BadgeElement = BadgeElement> = {
    children: JSX.Element;
    theme: "primary" | "secondary";
    as?: T;
} & ComponentProps<T>;

export const Badge: Component<Props> = (props) => {
    const themeClass = () =>
        ({
            secondary: "bg-neutral-800 text-neutral-100",
            primary: "bg-neutral-100 text-neutral-800 font-bold",
        })[props.theme];

    return (
        <Dynamic
            {...props}
            component={props.as ?? "span"}
            class={`uppercase inline-flex justify-center items-center rounded-full px-3 py-0.5 text-md ${themeClass()} ${
                props.class
            }`}
        >
            {props.children}
        </Dynamic>
    );
};
