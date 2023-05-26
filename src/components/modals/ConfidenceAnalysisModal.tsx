import { Component, Setter } from "solid-js";
import Modal from "../common/Modal";
import { SummaryCard } from "../views/analysis/SummaryCards";
import { hashtag, presentationChartLine, user } from "solid-heroicons/solid";
import { winrateToRating } from "../../lib/rating/ratings";

type Props = {
    isOpen: boolean;
    setIsOpen: Setter<boolean>;
    data: {
        rating: number;
        games: number;
        wins: number;
    };
};

export const ConfidenceAnalysisModal: Component<Props> = (props) => {
    return (
        <Modal
            isOpen={props.isOpen}
            setIsOpen={props.setIsOpen}
            title="Confidence analysis"
            size="3xl"
        >
            <div
                class={`grid overflow-hidden rounded-lg bg-[#191919] grid-cols-2 sm:grid-cols-3`}
            >
                <SummaryCard
                    class="!py-2"
                    icon={presentationChartLine}
                    title="Draftgap winrate"
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
                    class="!py-2"
                    icon={presentationChartLine}
                    title="Observed winrate"
                    rating={winrateToRating(props.data.wins / props.data.games)}
                    tooltip={
                        <>
                            Raw winrate from the sample of games from the
                            dataset.
                        </>
                    }
                />
                <SummaryCard
                    class="!py-2"
                    icon={hashtag}
                    title="Observed games"
                    number={Math.ceil(props.data.games)}
                    tooltip={
                        <>Number of games in the sample from the dataset.</>
                    }
                />
            </div>
        </Modal>
    );
};
