import { Match, Switch } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Role } from "../../../lib/models/Role";
import BottomIcon from "./BottomIcon";
import JungleIcon from "./JungleIcon";
import MidIcon from "./MidIcon";
import TopIcon from "./TopIcon";
import SupportIcon from "./SupportIcon";

export function RoleIcon(
    props: JSX.SvgSVGAttributes<SVGSVGElement> & { role: Role }
) {
    return (
        <Switch>
            <Match when={props.role === Role.Bottom}>
                <BottomIcon {...props} />
            </Match>
            <Match when={props.role === Role.Top}>
                <TopIcon {...props} />
            </Match>
            <Match when={props.role === Role.Middle}>
                <MidIcon {...props} />
            </Match>
            <Match when={props.role === Role.Jungle}>
                <JungleIcon {...props} />
            </Match>
            <Match when={props.role === Role.Support}>
                <SupportIcon {...props} />
            </Match>
        </Switch>
    );
}
