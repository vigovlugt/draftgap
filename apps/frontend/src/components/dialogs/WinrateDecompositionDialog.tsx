import { Component } from "solid-js";
import { SummaryCard } from "../views/analysis/SummaryCards";
import { hashtag, presentationChartLine } from "solid-heroicons/solid";
import { winrateToRating } from "@draftgap/core/src/rating/ratings";
import { DialogContent, DialogHeader, DialogTitle } from "../common/Dialog";
import { useUser } from "../../contexts/UserContext";
import { t } from "../../utils/i18n";

type Props = {
    data: {
        rating: number;
        games: number;
        wins: number;
    };
};

export const WinrateDecompositionDialog: Component<Props> = (props) => {
    const { config } = useUser();

    return (
        <DialogContent class="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{t(config, "winrateDecomposition")}</DialogTitle>
            </DialogHeader>
            <div
                class={`grid overflow-hidden rounded-lg bg-primary grid-cols-2 sm:grid-cols-3`}
            >
                <SummaryCard
                    class="py-2!"
                    icon={presentationChartLine}
                    title={t(config, "draftgapWinrate")}
                    rating={props.data.rating}
                    tooltip={
                        <>
                            Winrate draftgap uses in the model, more
                            conservative than the real winrate. This winrate
                            will heavily change depending on the risk level.
                        </>
                    }
                />
                <SummaryCard
                    class="py-2!"
                    icon={presentationChartLine}
                    title={t(config, "observedWinrate")}
                    rating={winrateToRating(props.data.wins / props.data.games)}
                    tooltip={
                        <>
                            Raw normalized winrate from the sample of games from
                            the dataset.
                        </>
                    }
                />
                <SummaryCard
                    class="py-2!"
                    icon={hashtag}
                    title={t(config, "observedGames")}
                    number={Math.ceil(props.data.games)}
                    tooltip={
                        <>{t(config, "observedGamesTooltip")}</>
                    }
                />
            </div>
        </DialogContent>
    );
};
