import { For } from "solid-js";
import { getPickedChampionKey, useDraft } from "../../contexts/DraftContext";
import { Team } from "@draftgap/core/src/models/Team";

const TEAMS = ["ally", "opponent"] as const;

export function TeamSelector() {
    const { selection, select, allyTeam, opponentTeam, bans } = useDraft();

    function selectTeam(team: Team) {
        select(team, undefined, { type: selection.type });
    }

    const isTeamFull = (team: Team) =>
        selection.type === "ban"
            ? bans[team].every((ban) => ban !== undefined)
            : (team === "ally" ? allyTeam : opponentTeam).every(
                  (p) => getPickedChampionKey(p) !== undefined,
              );

    return (
        <span class="isolate inline-flex rounded-md shadow-xs">
            <For each={TEAMS}>
                {(team, i) => (
                    <button
                        type="button"
                        class="text-lg relative inline-flex items-center border text-neutral-300 border-neutral-700 bg-primary px-3 py-1 font-medium hover:bg-neutral-800 uppercase disabled:pointer-events-none disabled:text-neutral-700"
                        classList={{
                            "rounded-r-md": i() === TEAMS.length - 1,
                            "rounded-l-md": i() === 0,
                            "-ml-px": i() !== 0,
                            "text-white bg-neutral-700!":
                                selection.team === team,
                        }}
                        onClick={() => selectTeam(team)}
                        disabled={isTeamFull(team)}
                    >
                        {team}
                    </button>
                )}
            </For>
        </span>
    );
}
