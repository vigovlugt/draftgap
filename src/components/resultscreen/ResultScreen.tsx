import { createSignal } from "solid-js";
import { ButtonGroup } from "../common/ButtonGroup";
import { DuoResultTable } from "./DuoResultTable";
import { IndividualChampionsResult } from "./IndividualChampionsResult";
import { MatchupResultTable } from "./MatchupResultTable";
import { SummaryCards } from "./SummaryCards";
import { TotalChampionContributionTable } from "./TotalChampionContributionTable";

export default function ResultScreen() {
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    return (
        <div>
            <h2 class="text-6xl uppercase mb-6">Draft analysis</h2>
            <SummaryCards team="ally" />
            <SummaryCards team="opponent" class="mb-12 mt-6" />

            <div class="flex gap-4 mb-8" id="champions-result">
                <div class="w-1/2">
                    <h3 class="text-3xl uppercase mb-1">
                        Ally individual champions
                    </h3>
                    <IndividualChampionsResult team="ally" />
                </div>
                <div class="w-1/2">
                    <h3 class="text-3xl uppercase mb-1">
                        Opponent individual champions
                    </h3>
                    <IndividualChampionsResult team="opponent" />
                </div>
            </div>
            <div
                class="flex justify-between items-end mb-2"
                id="matchup-result"
            >
                <div class="">
                    <h3 class="text-3xl uppercase">Matchups</h3>
                    <p class="text-neutral-500 uppercase">
                        Champion winrates normalized
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
            <div class="flex gap-4 mb-8" id="duo-result">
                <div class="w-1/2">
                    <h3 class="text-3xl mb-1 uppercase">Ally duos</h3>
                    <DuoResultTable team="ally" />
                </div>
                <div class="w-1/2">
                    <h3 class="text-3xl mb-1 uppercase">Opponent duos</h3>
                    <DuoResultTable team="opponent" />
                </div>
            </div>

            <div class="flex gap-4 mb-8">
                <div class="w-1/2">
                    <h3 class="text-3xl mb-1 uppercase">
                        Ally total champion contribution
                    </h3>
                    <TotalChampionContributionTable team="ally" />
                </div>
                <div class="w-1/2">
                    <h3 class="text-3xl mb-1 uppercase">
                        Opponent total champion contribution
                    </h3>
                    <TotalChampionContributionTable team="opponent" />
                </div>
            </div>
        </div>
    );
}
