import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "../../lib/models/Team";
import { DropdownMenu, PopoverItem } from "../common/DropdownMenu";

export function TeamOptions(props: { team: Team }) {
    const { resetTeam } = useDraft();

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset team",
            onClick: () => {
                resetTeam(props.team);
            },
        },
    ];

    return (
        <div class="absolute right-1 top-0">
            <DropdownMenu items={items()}>
                <Icon path={ellipsisVertical} class="h-7" />
            </DropdownMenu>
        </div>
    );
}
