import { Component, ComponentProps, JSX, splitProps } from "solid-js";
import { cn } from "../../utils/style";

type Props = {
    children: JSX.Element;
};

export const Panel: Component<Props & ComponentProps<"div">> = (props) => {
    const [local, other] = splitProps(props, ["children", "class"]);
    return (
        <div {...other} class={cn("rounded-md bg-primary p-4", local.class)}>
            {local.children}
        </div>
    );
};

export const PanelHeader: Component<Props> = (props) => {
    return (
        <h2 class="uppercase mb-4 text-lg font-semibold leading-none">
            {props.children}
        </h2>
    );
};
