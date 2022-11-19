import { createDeferred, onCleanup, Show } from "solid-js";
import { useDraft } from "../context/DraftContext";
import clickOutside from "../directives/click-outside";
import { RoleIcon } from "./icons/roles/RoleIcon";
import { PickOptions } from "./PickOptions";

interface IProps {
    team: "ally" | "opponent";
    idx: number;
}

export function Pick({ team, idx }: IProps) {
    const {
        allyTeam,
        opponentTeam,
        allyTeamData,
        opponentTeamData,
        selection,
        select,
    } = useDraft()!;

    const picks = team === "ally" ? allyTeam : opponentTeam;
    const championData = team === "ally" ? allyTeamData : opponentTeamData;

    const pick = picks[idx];

    const isSelected = () => selection.team === team && selection.index === idx;

    const champion = () => {
        if (!pick.championKey) {
            return undefined;
        }

        return championData().get(pick.championKey);
    };

    return (
        <div
            class="flex-1 relative cursor-pointer border-t-2 border-neutral-700"
            classList={{
                "bg-neutral-700": isSelected(),
            }}
            onClick={() => select(team, idx)}
        >
            <Show when={!champion()}>
                <span class="absolute top-0 left-2 uppercase">
                    PICK {idx + 1}
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
                                    champion()!.id
                                }_0.jpg)`,
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
                                    <div class="flex flex-col items-center">
                                        <div class="text-md">
                                            <RoleIcon
                                                role={role}
                                                class="h-10"
                                                classList={{
                                                    "opacity-[0.37]": i > 0,
                                                }}
                                            />
                                        </div>
                                        <div class="text-md">
                                            {parseFloat(
                                                (probability * 100).toFixed(2)
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </Show>

            <PickOptions team={team} index={idx} />
        </div>
    );
}
