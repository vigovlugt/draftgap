import { createDroppable } from "@thisbeyond/solid-dnd";
import { Icon } from "solid-heroicons";
import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { PickOptions } from "./PickOptions";
import { lockOpen, lockClosed } from "solid-heroicons/solid-mini";
import { Role } from "../../lib/models/Role";
import { formatPercentage } from "../../utils/rating";
import { tooltip } from "../../directives/tooltip";
import { useTooltip } from "../../context/TooltipContext";
import { cursorArrowRays } from "solid-heroicons/solid";
tooltip;

interface IProps {
    team: "ally" | "opponent";
    index: number;
}

export function Pick({ team, index }: IProps) {
    const {
        allyTeam,
        opponentTeam,
        allyTeamData,
        opponentTeamData,
        selection,
        select,
        pickChampion,
        allyTeamComps,
        opponentTeamComps,
    } = useDraft();
    const { setPopoverVisible } = useTooltip();
    const picks = team === "ally" ? allyTeam : opponentTeam;
    const championData = team === "ally" ? allyTeamData : opponentTeamData;
    const teamComp = () =>
        team === "ally" ? allyTeamComps()[0] : opponentTeamComps()[0];

    const pick = picks[index];
    const teamCompRole = () =>
        [...teamComp()[0]?.entries()].find(
            (e) => e[1] === pick.championKey
        )?.[0];

    const isSelected = () =>
        selection.team === team && selection.index === index;

    const champion = () => {
        if (!pick.championKey) {
            return undefined;
        }

        return championData().get(pick.championKey);
    };

    function setRole(role: Role | undefined) {
        pickChampion(team, index, pick.championKey, role);
    }

    return (
        <div
            class="flex-1 relative border-t-2 border-neutral-700 hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
            classList={{
                "!bg-neutral-700": isSelected(),
                "cursor-pointer ": champion() === undefined,
            }}
            onClick={() => select(team, index)}
        >
            <Show when={!champion()}>
                <span class="absolute top-1 left-2 uppercase text-2xl">
                    PICK {index + 1}
                </span>
            </Show>

            <Show when={champion()}>
                {() => (
                    <>
                        <div
                            class="absolute top-0 bottom-0 left-0 h-full w-full"
                            style={{
                                "background-image": `linear-gradient(to bottom, rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%),
                                url(https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${
                                    champion()!.id === "Fiddlesticks"
                                        ? "FiddleSticks"
                                        : champion()!.id
                                }_0.jpg)`,
                                "background-position": "center 20%",
                                "background-size": "cover",
                            }}
                        ></div>

                        <span class="absolute top-0 left-2 uppercase text-2xl">
                            {champion()!.name}
                        </span>

                        <div
                            class="absolute bottom-0 left-0 right-0 flex justify-end overflow-x-auto pt-1 overflow-y-hidden"
                            classList={{
                                "bottom-1": pick.role !== undefined,
                            }}
                        >
                            {[...champion()!.probabilityByRole.entries()]
                                .filter(([, prob]) => prob > 0.05)
                                .sort(([, probA], [, probB]) => probB - probA)
                                .map(([role, probability], i) => (
                                    <div
                                        class="flex flex-col items-center relative group mx-[0.4rem] cursor-pointer"
                                        onClick={() => {
                                            setPopoverVisible(false);
                                            setRole(
                                                pick.role === undefined
                                                    ? role
                                                    : undefined
                                            );
                                        }}
                                        // @ts-ignore
                                        use:tooltip={{
                                            content: (
                                                <>
                                                    {pick.role !== undefined
                                                        ? "The champion is locked in this position, to choose an other position, click to unlock"
                                                        : "Click to lock the champion in this position, the current estimated position is highlighted"}
                                                </>
                                            ),
                                            placement: "top",
                                        }}
                                    >
                                        <div class="text-md">
                                            <RoleIcon
                                                role={role}
                                                class="h-8 lg:h-10"
                                                classList={{
                                                    "opacity-50":
                                                        teamCompRole() !== role,
                                                }}
                                            />
                                        </div>
                                        <Show when={pick.role === undefined}>
                                            <div
                                                class="text-md"
                                                classList={{
                                                    "opacity-75":
                                                        teamCompRole() !== role,
                                                }}
                                                // @ts-ignore
                                                use:tooltip={{
                                                    content: (
                                                        <>
                                                            The probability of
                                                            this champion being
                                                            played in this
                                                            position
                                                        </>
                                                    ),
                                                    placement: "top",
                                                }}
                                            >
                                                {formatPercentage(
                                                    probability,
                                                    1
                                                )}
                                            </div>
                                        </Show>
                                        <Icon
                                            path={
                                                pick.role === undefined
                                                    ? lockOpen
                                                    : lockClosed
                                            }
                                            class="absolute -top-1 -right-1 w-[20px]"
                                            classList={{
                                                "opacity-0 group-hover:opacity-100 group-hover:text-neutral-300":
                                                    pick.role === undefined,
                                            }}
                                            style={{
                                                filter:
                                                    pick.role !== undefined
                                                        ? "drop-shadow(2px 0 0 #191919) drop-shadow(-2px 0 0 #191919) drop-shadow(0 2px 0 #191919) drop-shadow(0 -2px 0 #191919)"
                                                        : undefined,
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </Show>

            <PickOptions team={team} index={index} />
        </div>
    );
}
