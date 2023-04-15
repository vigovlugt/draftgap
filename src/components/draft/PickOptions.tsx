import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";
import { DropdownMenu, PopoverItem } from "../common/DropdownMenu";
import { Role } from "../../lib/models/Role";
import { linkByStatsSite } from "../../utils/sites";

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

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset",
            onClick: () => pickChampion(team, index, undefined, undefined),
            disabled: !champion(),
            key: "r",
        },
        {
            icon: user,
            content: config().defaultStatsSite,
            href: champion()
                ? linkByStatsSite(
                      config().defaultStatsSite,
                      champion()!.id.toLowerCase(),
                      [...teamComps()[0][0].entries()].find(
                          ([, value]) =>
                              value === teamPicks()[index].championKey
                      )![0] as Role
                  )
                : "#",
            disabled: !champion(),
            key: "b",
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
