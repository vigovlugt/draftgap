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
            <Match when={props.role === "bottom"}>
                <BottomIcon {...props} />
            </Match>
            <Match when={props.role === "top"}>
                <TopIcon {...props} />
            </Match>
            <Match when={props.role === "middle"}>
                <MidIcon {...props} />
            </Match>
            <Match when={props.role === "jungle"}>
                <JungleIcon {...props} />
            </Match>
            <Match when={props.role === "support"}>
                <SupportIcon {...props} />
            </Match>
        </Switch>
    );
}
