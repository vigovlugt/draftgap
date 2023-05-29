import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "../../lib/models/Team";
import { Role } from "../../lib/models/Role";
import { linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
import AnyRoleIcon from "../icons/roles/AnyRoleIcon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuIcon,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../common/DropdownMenu";
import { As } from "@kobalte/core";

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

    return (
        <div class="absolute right-0 top-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <As component="button" class="px-1 py-2 rounded-md" />
                    <Icon path={ellipsisVertical} class="h-7" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        {champion()?.name ?? `Pick ${props.index + 1}`}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            disabled={!champion()}
                            onSelect={() =>
                                pickChampion(
                                    props.team,
                                    props.index,
                                    undefined,
                                    undefined
                                )
                            }
                        >
                            <DropdownMenuIcon path={trash} />
                            <span>Reset</span>
                            <DropdownMenuShortcut>R</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled={!champion()}
                            onSelect={() =>
                                window.open(
                                    champion()
                                        ? linkByStatsSite(
                                              config.defaultStatsSite,
                                              champion()!.id.toLowerCase(),
                                              [...teamComp().entries()].find(
                                                  ([, value]) =>
                                                      value ===
                                                      teamPicks()[props.index]
                                                          .championKey
                                              )![0] as Role
                                          )
                                        : "#"
                                )
                            }
                        >
                            <DropdownMenuIcon path={user} />
                            <span>{config.defaultStatsSite}</span>
                            <DropdownMenuShortcut>B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
