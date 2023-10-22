import { Component, Match, Switch, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Role } from "@draftgap/core/src/models/Role";
import BottomIcon from "./BottomIcon";
import JungleIcon from "./JungleIcon";
import MidIcon from "./MidIcon";
import TopIcon from "./TopIcon";
import SupportIcon from "./SupportIcon";

type Props = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "role"> & {
    role: Role;
};

export const RoleIcon: Component<Props> = (_props) => {
    const [props, externalProps] = splitProps(_props, ["role"]);

    return (
        <Switch>
            <Match when={props.role === Role.Bottom}>
                <BottomIcon {...externalProps} />
            </Match>
            <Match when={props.role === Role.Top}>
                <TopIcon {...externalProps} />
            </Match>
            <Match when={props.role === Role.Middle}>
                <MidIcon {...externalProps} />
            </Match>
            <Match when={props.role === Role.Jungle}>
                <JungleIcon {...externalProps} />
            </Match>
            <Match when={props.role === Role.Support}>
                <SupportIcon {...externalProps} />
            </Match>
        </Switch>
    );
};
