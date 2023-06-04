import { Show } from "solid-js";
import { Team } from "../../../lib/models/Team";
import { ViewTabs } from "../../common/ViewTabs";
import { useDraft } from "../../../contexts/DraftContext";
import { overflowEllipsis } from "../../../utils/strings";
import { BuildView } from "./BuildView";
import { useBuild } from "../../../contexts/BuildContext";
import { useDataset } from "../../../contexts/DatasetContext";
import { Dialog } from "../../common/Dialog";
import { BuildAnalysisDialog } from "../../dialogs/BuildAnalysisDialog";

export const BuildsViewTabs = (props: { team: Team }) => {
    const { allyTeam, opponentTeam } = useDraft();
    const { dataset } = useDataset();
    const { buildPick, setBuildPick } = useBuild();

    const team = () => (props.team === "ally" ? allyTeam : opponentTeam);

    return (
        <ViewTabs
            tabs={new Array(5)
                .fill(null)
                .map((_, i) => i)
                .filter((i) => team()[i].championKey !== undefined)
                .map((i) => ({
                    value: { team: props.team, index: i },
                    label: overflowEllipsis(
                        dataset()!.championData[team()[i].championKey!].name,
                        10
                    ),
                }))}
            selected={buildPick()}
            onChange={setBuildPick}
            equals={(a, b) => a?.team === b?.team && a?.index === b?.index}
            class="!w-auto !border-b-0"
        />
    );
};

export const BuildsView = () => {
    const {
        buildPick,
        selectedEntity,
        setSelectedEntity,
        showSelectedEntity,
        buildAnalysisResult,
    } = useBuild();

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
            <Show
                when={selectedEntity() !== undefined && buildAnalysisResult()}
            >
                <Dialog
                    open={showSelectedEntity()}
                    onOpenChange={() => setSelectedEntity(undefined)}
                >
                    <BuildAnalysisDialog />
                </Dialog>
            </Show>
        </>
    );
};
