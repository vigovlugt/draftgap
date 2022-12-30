import { createDroppable } from "@thisbeyond/solid-dnd";
import { Icon } from "solid-heroicons";
import { Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { PickOptions } from "./PickOptions";
import { lockOpen, lockClosed } from "solid-heroicons/solid-mini";
import { Role } from "../../lib/models/Role";

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
    } = useDraft();
    const picks = team === "ally" ? allyTeam : opponentTeam;
    const championData = team === "ally" ? allyTeamData : opponentTeamData;

    const pick = picks[index];

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
            class="flex-1 relative cursor-pointer border-t-2 border-neutral-700 hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
            classList={{
                "!bg-neutral-700": isSelected(),
            }}
            onClick={() => select(team, index)}
        >
            <Show when={!champion()}>
                <span class="absolute top-0 left-2 uppercase">
                    PICK {index + 1}
                </span>
            </Show>

            <Show when={champion()}>
                {() => (
                    <>
                        <div
                            class="absolute top-0 bottom-0 left-0 h-full w-full hover:brightness-110 transition-[filter] duration-150 ease-in-out"
                            style={{
                                "background-image": `linear-gradient(to bottom, rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%),
                                url(https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${
                                    champion()!.id === "Fiddlesticks"
                                        ? "FiddleSticks"
                                        : champion()!.id
                                }_0.jpg)`,
                                "background-position": "top center",
                                "background-size": "cover",
                            }}
                        ></div>

                        <span class="absolute top-0 left-2 uppercase">
                            {champion()!.name}
                        </span>

                        <div class="absolute bottom-0 right-2 flex space-x-2">
                            {[...champion()!.probabilityByRole.entries()]
                                .filter(([_, prob]) => prob > 0.05)
                                .sort(
                                    ([_, probA], [__, probB]) => probB - probA
                                )
                                .map(([role, probability], i) => (
                                    <div
                                        class="flex flex-col items-center relative group"
                                        onclick={() =>
                                            setRole(
                                                pick.role === undefined
                                                    ? role
                                                    : undefined
                                            )
                                        }
                                    >
                                        <div class="text-md">
                                            <RoleIcon
                                                role={role}
                                                class="h-10"
                                                classList={{
                                                    "opacity-50": i > 0,
                                                }}
                                            />
                                        </div>
                                        <div
                                            class="text-md"
                                            classList={{
                                                "opacity-75": i > 0,
                                            }}
                                        >
                                            {parseFloat(
                                                (probability * 100).toFixed(2)
                                            )}
                                        </div>
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
