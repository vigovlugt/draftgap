import { Show } from "solid-js";
import { useDraft } from "../context/DraftContext";

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
        pickChampion,
    } = useDraft()!;

    const picks = team === "ally" ? allyTeam : opponentTeam;
    const championData = team === "ally" ? allyTeamData : opponentTeamData;

    const pick = picks[idx];

    const champion = () => {
        if (!pick.championKey) {
            return undefined;
        }

        return championData().get(pick.championKey);
    };

    return (
        <div class="flex-1">
            <Show when={champion()} fallback="PICK">
                {() => champion()!.name}
            </Show>
        </div>
    );
}
