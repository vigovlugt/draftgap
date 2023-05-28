import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "../../lib/models/Team";
import { DropdownMenu, PopoverItem } from "../common/DropdownMenu";
import { Role } from "../../lib/models/Role";
import { linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
import AnyRoleIcon from "../icons/roles/AnyRoleIcon";

export function PickOptions(props: { team: Team; index: number }) {
    const { config } = useUser();
    const { dataset } = useDataset();
    const { pickChampion, allyTeam, opponentTeam } = useDraft();

    const { allyTeamComp, opponentTeamComp } = useDraftAnalysis();

    const teamPicks = () => (props.team === "ally" ? allyTeam : opponentTeam);
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const champion = () =>
        teamPicks()[props.index].championKey
            ? dataset()?.championData[teamPicks()[props.index].championKey!]
            : undefined;

    const items = (): PopoverItem[] => [
        {
            icon: trash,
            content: "Reset",
            onClick: () =>
                pickChampion(props.team, props.index, undefined, undefined),
            disabled: !champion(),
            key: "r",
        },
        {
            icon: user,
            content: config.defaultStatsSite,
            href: champion()
                ? linkByStatsSite(
                      config.defaultStatsSite,
                      champion()!.id.toLowerCase(),
                      [...teamComp().entries()].find(
                          ([, value]) =>
                              value === teamPicks()[props.index].championKey
                      )![0] as Role
                  )
                : "#",
            disabled: !champion(),
            key: "b",
        },
        // {
        //     icon: { path: <AnyRoleIcon /> },
        //     content: "Set role",
        //     items: [
        //         ...Object.entries(Role).map(([, value]) => ({
        //             content: value,
        //             onClick: () =>
        //                 pickChampion(
        //                     props.team,
        //                     props.index,
        //                     teamPicks()[props.index].championKey,
        //                     value as Role
        //                 ),
        //         })),
        //     ],
        // },
    ];

    return (
        <div class="absolute right-0 top-0">
            <DropdownMenu items={items()}>
                <Icon path={ellipsisVertical} class="h-7" />
            </DropdownMenu>
        </div>
    );
}
