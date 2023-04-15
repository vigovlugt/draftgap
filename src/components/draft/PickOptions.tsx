import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { arrowTopRightOnSquare, trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";
import { DropdownMenu, PopoverItem } from "../common/DropdownMenu";
import { Role } from "../../lib/models/Role";

export const LOLALYTICS_ROLES = [
    "top",
    "jungle",
    "middle",
    "bottom",
    "support",
] as const;
export type LolalyticsRole = typeof LOLALYTICS_ROLES[number];

export function PickOptions({ team, index }: { team: Team; index: number }) {
    const {
        pickChampion,
        allyTeam,
        opponentTeam,
        dataset,
        config,
        allyTeamComps,
        opponentTeamComps,
    } = useDraft();

    const teamPicks = () => (team === "ally" ? allyTeam : opponentTeam);
    const teamComps = () =>
        team === "ally" ? allyTeamComps() : opponentTeamComps();

    const champion = () =>
        teamPicks()[index].championKey
            ? dataset()?.championData[teamPicks()[index].championKey!]
            : undefined;

    const linkByStatsSite = (champion: string, role: Role) => {
        switch (config().defaultStatsSite) {
            case "lolalytics":
                return `https://lolalytics.com/lol/${champion}/build/?lane=${LOLALYTICS_ROLES[role]}`;
            case "u.gg":
                return `https://u.gg/lol/champions/${champion}/build?role=${LOLALYTICS_ROLES[role]}`;
            case "op.gg":
                return `https://op.gg/champions/${champion}/${LOLALYTICS_ROLES[role]}/build`;
        }
    };

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset",
            onClick: () => pickChampion(team, index, undefined, undefined),
            disabled: !champion(),
        },
        {
            icon: user,
            content: config().defaultStatsSite,
            href: champion()
                ? linkByStatsSite(
                      champion()!.id.toLowerCase(),
                      [...teamComps()[0][0].entries()].find(
                          ([, value]) =>
                              value === teamPicks()[index].championKey
                      )![0] as Role
                  )
                : "#",
            disabled: !champion(),
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
