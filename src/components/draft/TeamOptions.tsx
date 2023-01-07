import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";
import { DropdownMenu, PopoverItem } from "../common/DropdownMenu";

export function TeamOptions({ team }: { team: Team }) {
    const { resetTeam } = useDraft();

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset team",
            onClick: () => {
                resetTeam(team);
            },
        },
    ];

    return (
        <div class="absolute right-0 top-0">
            <DropdownMenu items={items()}>
                <Icon path={ellipsisVertical} class="h-7"></Icon>
            </DropdownMenu>
        </div>
    );
}
