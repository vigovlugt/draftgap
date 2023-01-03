import { Component, Match, Switch } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Role } from "../../../lib/models/Role";
import BottomIcon from "./BottomIcon";
import JungleIcon from "./JungleIcon";
import MidIcon from "./MidIcon";
import TopIcon from "./TopIcon";
import SupportIcon from "./SupportIcon";

type Props = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "role"> & {
    role: Role;
};

export const RoleIcon: Component<Props> = ({ role, ...props }) => {
    return (
        <Switch>
            <Match when={role === Role.Bottom}>
                <BottomIcon {...props} />
            </Match>
            <Match when={role === Role.Top}>
                <TopIcon {...props} />
            </Match>
            <Match when={role === Role.Middle}>
                <MidIcon {...props} />
            </Match>
            <Match when={role === Role.Jungle}>
                <JungleIcon {...props} />
            </Match>
            <Match when={role === Role.Support}>
                <SupportIcon {...props} />
            </Match>
        </Switch>
    );
};
