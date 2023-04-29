import { Show, createSignal } from "solid-js";
import { Team } from "../../../lib/models/Team";
import { ViewTabs } from "../../common/ViewTabs";
import { useDraft } from "../../../context/DraftContext";
import { overflowEllipsis } from "../../../utils/strings";
import { BuildView } from "./BuildView";
import { useBuild } from "../../../context/BuildContext";
import { BuildAnalysisModal } from "../../modals/BuildAnalysisModal";

export const BuildsView = () => {
    const { allyTeam, opponentTeam, dataset } = useDraft();
    const {
        buildPick,
        setBuildPick,
        selectedEntity,
        setSelectedEntity,
        showSelectedEntity,
    } = useBuild();

    const BuildsViewTabs = (props: { team: Team }) => {
        const team = () => (props.team === "ally" ? allyTeam : opponentTeam);
        return (
            <ViewTabs
                tabs={new Array(5).fill(null).map((_, i) => ({
                    value: { team: props.team, index: i },
                    label: overflowEllipsis(
                        dataset()!.championData[team()[i].championKey!].name,
                        10
                    ),
                }))}
                selected={buildPick()}
                onChange={setBuildPick}
                className="!w-auto !border-b-0"
            />
        );
    };

    return (
        <>
            <div class="flex justify-between bg-primary xl:px-8 border-b border-neutral-700">
                <BuildsViewTabs team="ally" />
                <BuildsViewTabs team="opponent" />
            </div>
            <div class="py-5 px-4 xl:px-8 h-full overflow-y-auto">
                <Show
                    when={buildPick()}
                    fallback={
                        <div class="text-neutral-500 text-2xl text-center grid place-items-center h-full">
                            Select a champion to view their build
                        </div>
                    }
                >
                    <BuildView />
                </Show>
            </div>
            <Show when={selectedEntity() !== undefined}>
                <BuildAnalysisModal
                    isOpen={showSelectedEntity()}
                    setIsOpen={() => setSelectedEntity(undefined)}
                />
            </Show>
        </>
    );
};
