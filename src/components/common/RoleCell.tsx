import { Role } from "../../lib/models/Role";
import { RoleIcon } from "../icons/roles/RoleIcon";

export function RoleCell({ role }: { role: Role }) {
    return (
        <div class="flex items-center justify-center">
            <RoleIcon role={role} class="h-8" />
        </div>
    );
}
