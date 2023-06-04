import { Component, JSX } from "solid-js";

type Props = {
    children: JSX.Element;
};

export const Panel: Component<Props> = (props) => {
    return <div class="rounded-md bg-[#191919] p-4">{props.children}</div>;
};

export const PanelHeader: Component<Props> = (props) => {
    return (
        <h2 class="uppercase mb-4 text-lg font-semibold leading-none">
            {props.children}
        </h2>
    );
};
