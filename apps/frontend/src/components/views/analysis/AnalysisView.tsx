import { createSignal, Show } from "solid-js";
import { ButtonGroup } from "../../common/ButtonGroup";
import { DuoResultTable } from "./DuoResultTable";
import { IndividualChampionsResultTable } from "./IndividualChampionsResultTable";
import { MatchupResultTable } from "./MatchupResultTable";
import { DraftSummaryCards } from "./SummaryCards";
import { TotalChampionContributionTable } from "./TotalChampionContributionTable";
import { tooltip } from "../../../directives/tooltip";
import { Team } from "draftgap-core/src/models/Team";
import { useUser } from "../../../contexts/UserContext";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { Chart } from "../../common/Chart";
import { ChartConfiguration, ChartOptions } from "chart.js";
tooltip;

export default function AnalysisView() {
    const { config } = useUser();
    const { setAnalysisPick } = useDraftAnalysis();
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    const openChampionDraftAnalysisModal = (
        team: Team,
        championKey: string
    ) => {
        setAnalysisPick({ team, championKey });
    };

    return (
        <div>
            <DraftSummaryCards team="ally" />
            <DraftSummaryCards team="opponent" class="mb-12 mt-6" />

            <div
                class="flex-col md:flex-row flex gap-4 mb-8 overflow-hidden"
                id="total-result"
            >
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase ml-4"
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
                        }}
                    >
                        Ally overview
                    </h3>
                    <TotalChampionContributionTable
                        team="ally"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("ally", key)
                        }
                    />
                </div>
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase ml-4"
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
                        }}
                    >
                        Opponent overview
                    </h3>
                    <TotalChampionContributionTable
                        team="opponent"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("opponent", key)
                        }
                    />
                </div>
            </div>

            <Show when={!config.ignoreChampionWinrates}>
                <div
                    class="flex-col flex sm:flex-row gap-4 mb-8"
                    id="champions-result"
                >
                    <div class="sm:w-1/2">
                        <h3
                            class="text-3xl uppercase mb-1 ml-4"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>Base winrates of individual champions</>
                                ),
                            }}
                        >
                            Ally champions
                        </h3>
                        <IndividualChampionsResultTable
                            team="ally"
                            onClickChampion={(championKey) =>
                                openChampionDraftAnalysisModal(
                                    "ally",
                                    championKey
                                )
                            }
                        />
                    </div>
                    <div class="sm:w-1/2">
                        <h3
                            class="text-3xl uppercase mb-1 ml-4"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>Base winrates of individual champions</>
                                ),
                            }}
                        >
                            Opponent champions
                        </h3>
                        <IndividualChampionsResultTable
                            team="opponent"
                            onClickChampion={(championKey) =>
                                openChampionDraftAnalysisModal(
                                    "opponent",
                                    championKey
                                )
                            }
                        />
                    </div>
                </div>
            </Show>

            <div
                class="flex-col flex md:flex-row justify-between gap-2 md:items-end mb-2 items-end"
                id="matchup-result"
            >
                <div>
                    <h3
                        class="text-3xl uppercase ml-4"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    Winrates of all matchups between ally and
                                    opponent champions
                                </>
                            ),
                        }}
                    >
                        Matchups
                    </h3>
                    <p
                        class="text-neutral-500 uppercase ml-4"
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
                    selected={showAllMatchups()}
                    onChange={setShowAllMatchups}
                />
            </div>
            <MatchupResultTable
                class="w-full mb-8"
                showAll={showAllMatchups()}
                onClickChampion={(team, championKey) =>
                    openChampionDraftAnalysisModal(team, championKey)
                }
            />

            <div class="flex-col md:flex-row flex gap-4 mb-8" id="duo-result">
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase ml-4"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>Winrates of all duos in the ally draft</>
                            ),
                        }}
                    >
                        Ally duos
                    </h3>
                    <DuoResultTable
                        team="ally"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("ally", key)
                        }
                    />
                </div>
                <div class="md:w-1/2">
                    <h3
                        class="text-3xl mb-1 uppercase ml-4"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>Winrates of all duos in the opponent draft</>
                            ),
                        }}
                    >
                        Opponent duos
                    </h3>
                    <DuoResultTable
                        team="opponent"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("opponent", key)
                        }
                    />
                </div>
            </div>

            {/* <div class="flex-col flex gap-2 mb-2">
                <h3 class="text-3xl mb-1 uppercase ml-4">Scaling</h3>
                <div class="p-4 rounded-md bg-[#191919] w-1/2 max-w-4xl h-64">
                    <Chart
                        chart={
                            {
                                type: "line",
                                data: {
                                    labels: [
                                        { year: 2010, count: "0-15" },
                                        { year: 2011, count: "15-20" },
                                        { year: 2012, count: "20-25" },
                                        { year: 2013, count: "25-30" },
                                        { year: 2014, count: "30-35" },
                                        { year: 2015, count: "30-40" },
                                        { year: 2016, count: "40+" },
                                    ].map((row) => row.count),
                                    datasets: [
                                        {
                                            label: "ALLY".toUpperCase(),
                                            data: [
                                                { year: 2010, count: 10 },
                                                { year: 2011, count: 20 },
                                                { year: 2012, count: 15 },
                                                { year: 2013, count: 25 },
                                                { year: 2014, count: 22 },
                                                { year: 2015, count: 30 },
                                                { year: 2016, count: 28 },
                                            ].map((row) => row.count),
                                            borderColor: "#3c82f6",
                                        },
                                        {
                                            label: "OPPONENT".toUpperCase(),
                                            data: [
                                                { year: 2010, count: 10 },
                                                { year: 2011, count: 20 },
                                                { year: 2012, count: 15 },
                                                { year: 2013, count: 25 },
                                                { year: 2014, count: 22 },
                                                { year: 2015, count: 30 },
                                                { year: 2016, count: 28 },
                                            ]
                                                .map((row) => row.count)
                                                .reverse(),
                                            borderColor: "#ef4444",
                                        },
                                    ],
                                },
                                options: {
                                    pointStyle: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                        tooltip: {
                                            backgroundColor: "#444444",
                                        },
                                    },
                                    borderCapStyle: "round",
                                    borderWidth: 4,
                                    tension: 0.1,
                                },
                            } as ChartConfiguration
                        }
                    />
                </div>
            </div> */}
        </div>
    );
}