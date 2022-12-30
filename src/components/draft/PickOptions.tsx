import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { arrowTopRightOnSquare, trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";
import { Popover, PopoverItem } from "../common/Popover";

export const LOLALYTICS_ROLES = [
    "top",
    "jungle",
    "middle",
    "bottom",
    "support",
] as const;
export type LolalyticsRole = typeof LOLALYTICS_ROLES[number];

export function PickOptions({ team, index }: { team: Team; index: number }) {
    const { pickChampion, allyTeam, opponentTeam, dataset } = useDraft();

    const teamPicks = () => (team === "ally" ? allyTeam : opponentTeam);

    const champion = () =>
        teamPicks()[index].championKey
            ? dataset()?.championData[teamPicks()[index].championKey!]
            : undefined;

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset",
            onClick: () => pickChampion(team, index, undefined, undefined),
            disabled: !champion(),
        },
        {
            icon: user,
            content: (champion()?.name ?? "") + " Lolalytics",
            href: champion()
                ? `https://lolalytics.com/lol/${champion()!.id.toLowerCase()}/build/${
                      teamPicks()[index].role !== undefined
                          ? `?lane=${
                                LOLALYTICS_ROLES[teamPicks()[index].role!]
                            }`
                          : ``
                  }`
                : "#",
            disabled: !champion(),
        },
    ];

    return (
        <div class="absolute right-0 top-0">
            <Popover items={items()}>
                <Icon path={ellipsisVertical} class="h-7"></Icon>
            </Popover>
        </div>
    );
}
