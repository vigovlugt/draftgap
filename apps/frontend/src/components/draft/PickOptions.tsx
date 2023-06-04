import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { presentationChartLine, trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "../../lib/models/Team";
import { ROLES, Role } from "../../lib/models/Role";
import { linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
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
import { cn } from "../../utils/style";
import { buttonVariants } from "../common/Button";
import { For, Show } from "solid-js";
import { RoleIcon } from "../icons/roles/RoleIcon";

export function PickOptions(props: { team: Team; index: number }) {
    const { config } = useUser();
    const { dataset } = useDataset();
    const { pickChampion, allyTeam, opponentTeam } = useDraft();

    const { allyTeamComp, opponentTeamComp, setAnalysisPick } =
        useDraftAnalysis();

    const teamPicks = () => (props.team === "ally" ? allyTeam : opponentTeam);
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const champion = () =>
        teamPicks()[props.index].championKey
            ? dataset()?.championData[teamPicks()[props.index].championKey!]
            : undefined;

    return (
        <div class="absolute right-0 top-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <As
                        component="button"
                        class={cn(
                            buttonVariants({ variant: "transparent" }),
                            "px-1 py-2"
                        )}
                    />
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
                        <DropdownMenuItem
                            disabled={!champion()}
                            onSelect={() =>
                                setAnalysisPick({
                                    team: props.team,
                                    championKey:
                                        teamPicks()[props.index].championKey!,
                                })
                            }
                        >
                            <DropdownMenuIcon path={presentationChartLine} />
                            <span>Analysis</span>
                            <DropdownMenuShortcut>F</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div class="flex px-1.5 justify-around">
                            <For each={ROLES}>
                                {(role) => (
                                    <button
                                        class={cn(
                                            buttonVariants({
                                                variant: "transparent",
                                            }),
                                            "px-1.5 relative"
                                        )}
                                        onClick={() =>
                                            pickChampion(
                                                props.team,
                                                props.index,
                                                teamPicks()[props.index]
                                                    .championKey,
                                                role
                                            )
                                        }
                                    >
                                        <RoleIcon
                                            role={role}
                                            class={cn(
                                                "h-6 w-6 text-neutral-500",
                                                {
                                                    "text-white":
                                                        teamPicks()[props.index]
                                                            .role === role,
                                                }
                                            )}
                                        />
                                        <Show
                                            when={
                                                teamPicks()[props.index]
                                                    .role === role
                                            }
                                        >
                                            <div class="h-[3px] w-full bg-neutral-50 -bottom-1.5 absolute left-0 rounded-t-full" />
                                        </Show>
                                    </button>
                                )}
                            </For>
                        </div>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
