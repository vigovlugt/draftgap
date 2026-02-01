import { displayNameByRole } from "@draftgap/core/src/models/Role";
import { Team } from "@draftgap/core/src/models/Team";
import { ChampionIcon } from "../icons/ChampionIcon";
import { MatchupResultTable } from "../views/analysis/MatchupResultTable";
import { ChampionSummaryCards } from "../views/analysis/SummaryCards";
import { tooltip } from "../../directives/tooltip";
import { DuoResultTable } from "../views/analysis/DuoResultTable";
import { buttonVariants } from "../common/Button";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
import { DialogContent, DialogTitle } from "../common/Dialog";
import { cn } from "../../utils/style";
import { displayNameByStatsSite, linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { championName } from "../../utils/i18n";
// eslint-disable-next-line 
tooltip;

type Props = {
    team: Team;
    championKey: string;
    openChampionDraftAnalysisModal: (team: Team, championKey: string) => void;
};

export function ChampionDraftAnalysisDialog(props: Props) {
    const { dataset } = useDataset();

    const {
        allyDraftAnalysis: allyDraftResult,
        opponentDraftAnalysis: opponentDraftResult,
        allyTeamComp,
        opponentTeamComp,
    } = useDraftAnalysis();
    const { config } = useUser();

    const draftResult = () =>
        props.team === "ally" ? allyDraftResult() : opponentDraftResult();
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const champion = () => dataset()!.championData[props.championKey];
    const name = () => championName(champion(), config);
    const role = () =>
        [...teamComp()].find(
            ([, championKey]) => championKey === props.championKey
        )?.[0];

    return (
        <DialogContent class="max-w-3xl">
            <div class="h-24 bg-[#101010] -m-6 mb-0" />
            <div class="flex gap-4 -mt-[78px] items-center">
                <div class="rounded-full border-primary border-8">
                    <ChampionIcon
                        championKey={props.championKey}
                        size={120 / 1.1}
                        class="rounded-full!"
                    />
                </div>
                <div class="flex flex-col justify-center">
                    <DialogTitle>{name()}</DialogTitle>
                    <span class="text-xl text-neutral-300 uppercase mb-[16px]">
                        {props.team} {displayNameByRole[role()!]}
                    </span>
                </div>
                <a
                    class={cn(
                        buttonVariants({ variant: "secondary" }),
                        "ml-auto mt-[64px]"
                    )}
                    href={linkByStatsSite(
                        config.defaultStatsSite,
                        champion().id,
                        role()!
                    )}
                    target="_blank"
                >
                    {displayNameByStatsSite(config.defaultStatsSite)}
                </a>
            </div>
            <ChampionSummaryCards
                team={props.team}
                championKey={props.championKey}
            />

            <div
                id="matchup-champion-result"
                class="overflow-x-hidden -m-1 p-1"
            >
                <h3
                    class="text-3xl uppercase ml-4"
                     
                    // @ts-ignore
                    use:tooltip={{
                        content: <>Winrates of all {name()} matchups</>,
                    }}
                >
                    Matchups
                </h3>
                <p
                    class="text-neutral-500 uppercase mb-1 ml-4"
                     
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                The individual champion winrates have been
                                normalized (removed) before calculating the
                                matchup winrates.
                            </>
                        ),
                    }}
                >
                    Champion winrates normalized
                </p>
                <MatchupResultTable
                    showAll={true}
                    class="ring-1 ring-white/10"
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
                    truncateChampionNames
                />
            </div>

            <div id="duo-champion-result" class="overflow-x-hidden -m-1 p-1">
                <h3
                    class="text-3xl uppercase mb-1 ml-4"
                     
                    // @ts-ignore
                    use:tooltip={{
                        content: <>Winrates of all {name()} duos</>,
                    }}
                >
                    Duos
                </h3>
                <DuoResultTable
                    team={props.team}
                    class="ring-1 ring-white/10"
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
        </DialogContent>
    );
}
