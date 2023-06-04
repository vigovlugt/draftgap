import { Role } from "../../lib/models/Role";
import { RoleIcon } from "../icons/roles/RoleIcon";

export function RoleCell(props: { role: Role }) {
    return (
        <div class="flex items-center justify-center">
            <RoleIcon role={props.role} class="h-8" />
        </div>
    );
}
