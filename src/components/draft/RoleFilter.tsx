import { For } from "solid-js";
import { useDraft } from "../../contexts/DraftContext";
import { ROLES } from "../../lib/models/Role";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDraftFilters } from "../../contexts/DraftFiltersContext";

export function RoleFilter(props: { class?: string }) {
    const { selection } = useDraft();
    const { roleFilter, setRoleFilter } = useDraftFilters();
    const { getFilledRoles } = useDraftAnalysis();

    const filledRoles = () =>
        (selection.team && getFilledRoles(selection.team)) ?? new Set();

    return (
        <span class={`isolate inline-flex rounded-md shadow-sm ${props.class}`}>
            <For each={ROLES}>
                {(role, i) => (
                    <button
                        type="button"
                        class="w-full text-lg relative inline-flex justify-center items-center border text-neutral-300 border-neutral-700 bg-primary px-1 sm:px-3 py-1 font-medium hover:enabled:bg-neutral-800 focus:z-10 disabled:text-neutral-700"
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
                        disabled={filledRoles().has(role)}
                    >
                        <RoleIcon role={role} class="h-7" />
                    </button>
                )}
            </For>
        </span>
    );
}
