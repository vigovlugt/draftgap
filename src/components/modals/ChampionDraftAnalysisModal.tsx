import { Component } from "solid-js";
import { displayNameByRole } from "../../lib/models/Role";
import { Team } from "../../lib/models/Team";
import Modal from "../common/Modal";
import { ChampionIcon } from "../icons/ChampionIcon";
import { MatchupResultTable } from "../views/analysis/MatchupResultTable";
import { ChampionSummaryCards } from "../views/analysis/SummaryCards";
import { tooltip } from "../../directives/tooltip";
import { DuoResultTable } from "../views/analysis/DuoResultTable";
import { Button } from "../common/Button";
import { LOLALYTICS_ROLES } from "../../lib/data/lolalytics/roles";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
tooltip;

type Props = {
    team: Team;
    championKey: string;
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    openChampionDraftAnalysisModal: (team: Team, championKey: string) => void;
};

export const ChampionDraftAnalysisModal: Component<Props> = (props) => {
    const { dataset } = useDataset();

    const {
        allyDraftAnalysis: allyDraftResult,
        opponentDraftAnalysis: opponentDraftResult,
        allyTeamComp,
        opponentTeamComp,
    } = useDraftAnalysis();

    const draftResult = () =>
        props.team === "ally" ? allyDraftResult() : opponentDraftResult();
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const champion = () => dataset()!.championData[props.championKey];
    const name = () => champion().name;
    const role = () =>
        [...teamComp()].find(
            ([, championKey]) => championKey === props.championKey
        )?.[0];

    return (
        <Modal
            isOpen={props.isOpen}
            setIsOpen={props.setIsOpen}
            title=""
            titleContainerClass="!h-0 !m-0"
            size="3xl"
        >
            <div class="h-24 bg-[#101010] -m-6 mb-0" />
            <div class="flex gap-4 -mt-[62.5px] items-center">
                <div class="rounded-full border-primary border-8">
                    <ChampionIcon
                        championKey={props.championKey}
                        size={120 / 1.1}
                        class="!rounded-full"
                    />
                </div>
                <div class="flex flex-col justify-center">
                    <h2 class="text-4xl uppercase mb-1">{name()}</h2>
                    <span class="text-xl text-neutral-300 uppercase mb-[16px]">
                        {props.team} {displayNameByRole[role()!]}
                    </span>
                </div>
                <Button
                    as="a"
                    href={`https://lolalytics.com/lol/${champion().id.toLowerCase()}/build/?lane=${
                        LOLALYTICS_ROLES[role()!]
                    }`}
                    target="_blank"
                    theme="secondary"
                    class="ml-auto mt-[64px]"
                >
                    Lolalytics
                </Button>
            </div>
            <ChampionSummaryCards
                team={props.team}
                championKey={props.championKey}
            />

            <div id="matchup-champion-result" class="mt-8">
                <h3
                    class="text-3xl uppercase ml-4"
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    use:tooltip={{
                        content: <>Winrates of all {name()} matchups</>,
                    }}
                >
                    Matchups
                </h3>
                <p
                    class="text-neutral-500 uppercase mb-1 ml-4"
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
                <MatchupResultTable
                    showAll={true}
                    class="ring-1 ring-white ring-opacity-10"
                    data={() => {
                        const data =
                            draftResult()
                                ?.matchupRating.matchupResults.filter(
                                    (result) =>
                                        result.championKeyA ===
                                            props.championKey ||
                                        result.championKeyB ===
                                            props.championKey
                                )
                                .sort((a, b) => a.roleB - b.roleB) ?? [];

                        return data;
                    }}
                    onClickChampion={(team, championKey) => {
                        props.openChampionDraftAnalysisModal(
                            props.team === "ally"
                                ? team
                                : team === "ally"
                                ? "opponent"
                                : "ally",
                            championKey
                        );
                    }}
                />
            </div>

            <div id="duo-champion-result" class="mt-4">
                <h3
                    class="text-3xl uppercase mb-1 ml-4"
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    use:tooltip={{
                        content: <>Winrates of all {name()} duos</>,
                    }}
                >
                    Duos
                </h3>
                <DuoResultTable
                    team={props.team}
                    class="ring-1 ring-white ring-opacity-10"
                    halfDuoRating
                    data={() => {
                        const data = draftResult()!
                            .allyDuoRating.duoResults.filter(
                                (result) =>
                                    result.championKeyA === props.championKey ||
                                    result.championKeyB === props.championKey
                            )
                            .map((r) => {
                                if (r.championKeyA === props.championKey) {
                                    return r;
                                }

                                return {
                                    ...r,
                                    championKeyA: r.championKeyB,
                                    roleA: r.roleB,
                                    championKeyB: r.championKeyA,
                                    roleB: r.roleA,
                                };
                            })
                            .sort((a, b) => a.roleB - b.roleB);

                        return data;
                    }}
                    onClickChampion={(championKey) => {
                        props.openChampionDraftAnalysisModal(
                            props.team,
                            championKey
                        );
                    }}
                />
            </div>
        </Modal>
    );
};
