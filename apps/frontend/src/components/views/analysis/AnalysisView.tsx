import { createSignal, Show } from "solid-js";
import { ButtonGroup } from "../../common/ButtonGroup";
import { DuoResultTable } from "./DuoResultTable";
import { IndividualChampionsResultTable } from "./IndividualChampionsResultTable";
import { MatchupResultTable } from "./MatchupResultTable";
import { DraftSummaryCards } from "./SummaryCards";
import { TotalChampionContributionTable } from "./TotalChampionContributionTable";
import { tooltip } from "../../../directives/tooltip";
import { Team } from "@draftgap/core/src/models/Team";
import { useUser } from "../../../contexts/UserContext";
import { useDraftAnalysis } from "../../../contexts/DraftAnalysisContext";
import { ScalingChart } from "./ScalingChart";
import { t } from "../../../utils/i18n";
// eslint-disable-next-line
tooltip;

export default function AnalysisView() {
    const { config } = useUser();
    const { setAnalysisPick } = useDraftAnalysis();
    const [showAllMatchups, setShowAllMatchups] = createSignal(false);

    const openChampionDraftAnalysisModal = (
        team: Team,
        championKey: string,
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
                        class="text-2xl mb-1 uppercase ml-4 sm:text-3xl"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>{t(config, "overviewTooltip")}</>
                            ),
                        }}
                    >
                        {t(config, "allyOverview")}
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
                        class="text-2xl mb-1 uppercase ml-4 sm:text-3xl"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>{t(config, "overviewTooltip")}</>
                            ),
                        }}
                    >
                        {t(config, "opponentOverview")}
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
                            class="text-2xl uppercase mb-1 ml-4 sm:text-3xl"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>
                                        {t(
                                            config,
                                            "baseChampionWinratesTooltip",
                                        )}
                                    </>
                                ),
                            }}
                        >
                            {t(config, "allyChampions")}
                        </h3>
                        <IndividualChampionsResultTable
                            team="ally"
                            onClickChampion={(championKey) =>
                                openChampionDraftAnalysisModal(
                                    "ally",
                                    championKey,
                                )
                            }
                        />
                    </div>
                    <div class="sm:w-1/2">
                        <h3
                            class="text-2xl uppercase mb-1 ml-4 sm:text-3xl"
                            // @ts-ignore
                            use:tooltip={{
                                content: (
                                    <>
                                        {t(
                                            config,
                                            "baseChampionWinratesTooltip",
                                        )}
                                    </>
                                ),
                            }}
                        >
                            {t(config, "opponentChampions")}
                        </h3>
                        <IndividualChampionsResultTable
                            team="opponent"
                            onClickChampion={(championKey) =>
                                openChampionDraftAnalysisModal(
                                    "opponent",
                                    championKey,
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
                        class="text-2xl uppercase ml-4 sm:text-3xl"
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
                        {t(config, "matchups")}
                    </h3>
                    <p
                        class="text-neutral-500 uppercase ml-4"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    The individual champion winrates have been
                                    normalized (removed) before calculating the
                                    matchup winrates to remove the current meta
                                    bias of the matchup.
                                </>
                            ),
                        }}
                    >
                        {t(config, "championWinratesNormalized")}
                    </p>
                </div>
                <ButtonGroup
                    options={[
                        { label: t(config, "headToHead"), value: false },
                        { label: t(config, "all"), value: true },
                    ]}
                    size="sm"
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
                        class="text-2xl uppercase ml-4 sm:text-3xl"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>{t(config, "allAllyDuosTooltip")}</>
                            ),
                        }}
                    >
                        {t(config, "allyDuos")}
                    </h3>
                    <p
                        class="text-neutral-500 uppercase ml-4 mb-2"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    The individual champion winrates have been
                                    normalized (removed) before calculating the
                                    duo winrates.
                                </>
                            ),
                        }}
                    >
                        {t(config, "championWinratesNormalized")}
                    </p>
                    <DuoResultTable
                        team="ally"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("ally", key)
                        }
                    />
                </div>
                <div class="md:w-1/2">
                    <h3
                        class="text-2xl uppercase ml-4 sm:text-3xl"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>{t(config, "allOpponentDuosTooltip")}</>
                            ),
                        }}
                    >
                        {t(config, "opponentDuos")}
                    </h3>
                    <p
                        class="text-neutral-500 uppercase ml-4 mb-2"
                        // @ts-ignore
                        use:tooltip={{
                            content: (
                                <>
                                    The individual champion winrates have been
                                    normalized (removed) before calculating the
                                    duo winrates.
                                </>
                            ),
                        }}
                    >
                        {t(config, "championWinratesNormalized")}
                    </p>
                    <DuoResultTable
                        team="opponent"
                        onClickChampion={(key) =>
                            openChampionDraftAnalysisModal("opponent", key)
                        }
                    />
                </div>
            </div>

            {/* <div class="mb-2 mt-16 flex justify-center items-center gap-2">
                <div class="h-[3px] bg-neutral-700 w-24" />

                <h2 class="text-3xl uppercase text-neutral-500 text-center sm:text-4xl">
                    Misc
                </h2>

                <div class="h-[3px] bg-neutral-700 w-24" />
            </div> */}

            <div>
                <h3 class="text-2xl uppercase ml-4 sm:text-3xl">
                    {t(config, "scaling")}
                </h3>
                <span
                    class="text-neutral-500 uppercase ml-4 mb-2"
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                The overall team winrate has been normalized
                                (removed) before calculating the team winrate
                                over time.
                            </>
                        ),
                    }}
                >
                    {t(config, "teamWinrateNormalized")}
                </span>
                <div class="p-4 rounded-md bg-primary w-1/2 max-w-2xl h-64">
                    <ScalingChart />
                </div>
            </div>
        </div>
    );
}
