import { createSignal } from "solid-js";
import { ButtonGroup } from "../common/ButtonGroup";
import { IndividualChampionsResult } from "./IndividualChampionsResult";
import { MatchupResultTable } from "./MatchupResultTable";

export default function ResultScreen() {
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    return (
        <div>
            <h2 class="text-6xl uppercase">Draft</h2>
            <h3 class="text-4xl uppercase">Individual champion winrates</h3>
            <IndividualChampionsResult class="w-full mb-8" />
            <div class="flex justify-between align-center mb-2">
                <h3 class="text-4xl uppercase">Normalized matchup winrates</h3>
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
        </div>
    );
}
