import { createSignal, Show } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { ButtonGroup } from "../common/ButtonGroup";
import { DuoResultTable } from "./DuoResultTable";
import { IndividualChampionsResult } from "./IndividualChampionsResult";
import { MatchupResultTable } from "./MatchupResultTable";
import { SummaryCards } from "./SummaryCards";
import { TotalChampionContributionTable } from "./TotalChampionContributionTable";
import { tooltip } from "../../directives/tooltip";
tooltip;

export default function ResultScreen() {
    const { config } = useDraft();

    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    return (
        <div>
            <h2 class="text-6xl uppercase mb-6">Draft analysis</h2>
            <SummaryCards team="ally" />
            <SummaryCards team="opponent" class="mb-12 mt-6" />

            <Show when={!config().ignoreChampionWinrates}>
                <div
                    class="flex-col flex sm:flex-row gap-4 mb-8"
                    id="champions-result"
                >
                    <div class="sm:w-1/2">
                        <h3
                            class="text-3xl uppercase mb-1"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>Base winrates of individual champions</>
                                ),
                                placement: "top",
                            }}
                        >
                            Ally champions
                        </h3>
                        <IndividualChampionsResult team="ally" />
                    </div>
                    <div class="sm:w-1/2">
                        <h3
                            class="text-3xl uppercase mb-1"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>Base winrates of individual champions</>
                                ),
                                placement: "top",
                            }}
                        >
                            Opponent champions
                        </h3>
                        <IndividualChampionsResult team="opponent" />
                    </div>
                </div>
            </Show>

            <div
                class="flex-col flex md:flex-row justify-between gap-2 md:items-end mb-2"
                id="matchup-result"
            >
                <div class="">
                    <h3
                        class="text-3xl uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    Winrates of all matchups between ally and
                                    opponent champios
                                </>
                            ),
                            placement: "top",
                        }}
                    >
                        Matchups
                    </h3>
                    <p
                        class="text-neutral-500 uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    The individual champion winrates have been
                                    normalized (removed) before calculating the
                                    matchup winrates, this to remove the current
                                    meta bias of the matchup.
                                </>
                            ),
                            placement: "top",
                        }}
                    >
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

            <div class="flex-col md:flex-row flex gap-4 mb-8" id="duo-result">
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>Winrates of all duos in the ally draft</>
                            ),
                            placement: "top",
                        }}
                    >
                        Ally duos
                    </h3>
                    <DuoResultTable team="ally" />
                </div>
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>Winrates of all duos in the opponent draft</>
                            ),
                            placement: "top",
                        }}
                    >
                        Opponent duos
                    </h3>
                    <DuoResultTable team="opponent" />
                </div>
            </div>

            <div
                class="flex-col md:flex-row flex gap-4 mb-8 overflow-hidden"
                id="total-result"
            >
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    How much does every champion contribute to
                                    the draft in which aspect?
                                    <br />
                                    <br />
                                    <strong>BASE</strong>: Champion base winrate
                                    <br />
                                    <strong>MATCHUP</strong>: Total winrate of
                                    all champion matchups
                                    <br />
                                    <strong>DUO</strong>: Total winrate of all
                                    champion duos
                                    <br />
                                    <strong>TOTAL</strong>: Total contribution
                                    of champion (BASE + MATCHUP + DUO)
                                </>
                            ),
                            placement: "top",
                        }}
                    >
                        Ally overview
                    </h3>
                    <TotalChampionContributionTable team="ally" />
                </div>
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    How much does every champion contribute to
                                    the draft in which aspect?
                                    <br />
                                    <br />
                                    <strong>BASE</strong>: Champion base winrate
                                    <br />
                                    <strong>MATCHUP</strong>: Total winrate of
                                    all champion matchups
                                    <br />
                                    <strong>DUO</strong>: Total winrate of all
                                    champion duos
                                    <br />
                                    <strong>TOTAL</strong>: Total contribution
                                    of champion (BASE + MATCHUP + DUO)
                                </>
                            ),
                            placement: "top",
                        }}
                    >
                        Opponent overview
                    </h3>
                    <TotalChampionContributionTable team="opponent" />
                </div>
            </div>
        </div>
    );
}
