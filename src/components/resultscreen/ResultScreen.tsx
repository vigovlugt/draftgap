import { createSignal } from "solid-js";
import { ButtonGroup } from "../common/ButtonGroup";
import { DuoResultTable } from "./DuoResultTable";
import { IndividualChampionsResult } from "./IndividualChampionsResult";
import { MatchupResultTable } from "./MatchupResultTable";

export default function ResultScreen() {
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    return (
        <div>
            <h2 class="text-6xl uppercase">Draft analysis</h2>
            <h3 class="text-4xl uppercase">Base champion winrates</h3>
            <IndividualChampionsResult class="w-full mb-8" />

            <div class="flex justify-between items-end mb-2">
                <div>
                    <h3 class="text-4xl uppercase">Matchup winrates</h3>
                    <p class="text-neutral-500">
                        Base champion winrates normalized
                    </p>
                </div>
                <ButtonGroup
                    options={[
                        { label: "HEAD 2 HEAD", value: false },
                        { label: "ALL", value: true },
                    ]}
                    selected={showAllMatchups}
                    onChange={setShowAllMatchups}
                />
            </div>
            <MatchupResultTable class="w-full mb-8" showAll={showAllMatchups} />

            <div class="flex gap-4 mb-8">
                <div class="w-1/2">
                    <h3 class="text-4xl uppercase">Ally duos</h3>
                    <DuoResultTable team="ally" />
                </div>
                <div class="w-1/2">
                    <h3 class="text-4xl uppercase">Opponent duos</h3>
                    <DuoResultTable team="opponent" />
                </div>
            </div>
        </div>
    );
}
