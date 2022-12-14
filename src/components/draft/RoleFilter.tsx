import { Accessor, For, Setter } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { Role, ROLES } from "../../lib/models/Role";
import { RoleIcon } from "../icons/roles/RoleIcon";

export function RoleFilter({ className }: { className?: string }) {
    const { roleFilter, setRoleFilter } = useDraft();

    return (
        <span class={`isolate inline-flex rounded-md shadow-sm ${className}`}>
            <For each={ROLES}>
                {(role, i) => (
                    <button
                        type="button"
                        class="w-full text-lg relative inline-flex justify-center items-center border text-neutral-300 border-neutral-700 bg-primary px-1 sm:px-3 py-1 font-medium hover:bg-neutral-800 focus:z-10"
                        classList={{
                            "rounded-r-md": i() === ROLES.length - 1,
                            "rounded-l-md": i() === 0,
                            "-ml-px": i() !== 0,
                            "text-white !bg-neutral-700": roleFilter() === role,
                        }}
                        onClick={() =>
                            roleFilter() === role
                                ? setRoleFilter(undefined)
                                : setRoleFilter(role)
                        }
                    >
                        <RoleIcon role={role} class="h-7" />
                    </button>
                )}
            </For>
        </span>
    );
}
