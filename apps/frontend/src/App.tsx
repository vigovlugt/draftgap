import { Icon } from "solid-heroicons";
import {
    Component,
    createEffect,
    createSignal,
    For,
    Match,
    Show,
    Switch,
} from "solid-js";
import DraftTable from "./components/draft/DraftTable";
import { RoleFilter } from "./components/draft/RoleFilter";
import { Search } from "./components/draft/Search";
import { TeamSelector } from "./components/draft/TeamSelector";
import { TeamSidebar } from "./components/draft/TeamSidebar";
import { cog_6Tooth } from "solid-heroicons/solid";
import AnalysisView from "./components/views/analysis/AnalysisView";
import { LolClientStatusBadge } from "./components/draft/LolClientStatusBadge";
import { useLolClient } from "./contexts/LolClientContext";
import { Badge } from "./components/common/Badge";
import { FilterMenu } from "./components/draft/FilterMenu";
import { formatDistance } from "date-fns";
import { ViewTabs } from "./components/common/ViewTabs";
import { BuildsView } from "./components/views/builds/BuildsView";
import { useDraftView } from "./contexts/DraftViewContext";
import { useUser } from "./contexts/UserContext";
import { useDataset } from "./contexts/DatasetContext";
import { LoadingIcon } from "./components/icons/LoadingIcon";
import { DialogTrigger, Dialog } from "./components/common/Dialog";
import SettingsDialog from "./components/dialogs/SettingsDialog";
import { FAQDialog } from "./components/dialogs/FAQDialog";
import { DesktopAppDialog } from "./components/dialogs/DesktopAppDialog";
import { UpdateDialog } from "./components/dialogs/UpdateDialog";
import { OptionsDropdownMenu } from "./components/OptionsMenu";
import { useDraftAnalysis } from "./contexts/DraftAnalysisContext";
import { ChampionDraftAnalysisDialog } from "./components/dialogs/ChampionDraftAnalysisDialog";

const App: Component = () => {
    const { config } = useUser();
    const { currentDraftView, setCurrentDraftView } = useDraftView();
    const { dataset, isLoaded } = useDataset();
    const { analysisPick, setAnalysisPick, showAnalysisPick } =
        useDraftAnalysis();
    const { startLolClientIntegration, stopLolClientIntegration } =
        useLolClient();

    createEffect(() => {
        if (config.disableLeagueClientIntegration) {
            stopLolClientIntegration();
        } else {
            startLolClientIntegration();
        }
    });

    const [showSettings, setShowSettings] = createSignal(false);
    const [showFAQ, setShowFAQ] = createSignal(false);
    const [showDownloadModal, setShowDownloadModal] = createSignal(false);

    const timeAgo = () =>
        dataset()
            ? formatDistance(new Date(dataset()!.date), new Date(), {
                  addSuffix: true,
              })
            : "";

    const MainView = () => {
        return (
            <div
                class="bg-[#101010] flex-1 overflow-auto overflow-x-hidden h-full flex flex-col"
                style={{
                    "scroll-behavior": "smooth",
                }}
            >
                <Switch>
                    <Match
                        when={
                            dataset.state === "ready" && dataset() === undefined
                        }
                    >
                        <div class="flex justify-center items-center h-full text-2xl text-red-500">
                            An unexpected error occurred. Please try again
                            later.
                        </div>
                    </Match>
                    <Match when={!isLoaded()}>
                        <div class="flex justify-center items-center h-full text-2xl">
                            <LoadingIcon class="animate-spin h-10 w-10" />
                        </div>
                    </Match>
                    <Match when={isLoaded()}>
                        <Dialog
                            open={showAnalysisPick()}
                            onOpenChange={(open) => {
                                if (!open) setAnalysisPick(undefined);
                            }}
                        >
                            <ChampionDraftAnalysisDialog
                                championKey={analysisPick()!.championKey}
                                team={analysisPick()!.team}
                                openChampionDraftAnalysisModal={(
                                    team,
                                    championKey
                                ) => setAnalysisPick({ team, championKey })}
                            />
                        </Dialog>
                        <div class="flex flex-col min-h-full flex-1">
                            <ViewTabs
                                tabs={
                                    [
                                        {
                                            label: "Draft",
                                            value: "draft",
                                        },
                                        {
                                            label: "Draft Analysis",
                                            value: "analysis",
                                        },
                                        ...(import.meta.env.DEV
                                            ? ([
                                                  {
                                                      label: "Builds",
                                                      value: "builds",
                                                  },
                                              ] as const)
                                            : []),
                                    ] as const
                                }
                                selected={currentDraftView().type}
                                onChange={(type) =>
                                    setCurrentDraftView({
                                        type,
                                        subType: "draft",
                                    })
                                }
                                class="xl:px-8"
                            />
                            <Switch>
                                <Match
                                    when={currentDraftView().type == "draft"}
                                >
                                    <div class="py-5 px-4 xl:px-8 h-full overflow-y-hidden flex flex-col">
                                        <div class="mb-4 flex gap-4">
                                            <Search />
                                            <TeamSelector />
                                            <RoleFilter class="hidden lg:inline-flex" />
                                            <div class="hidden lg:inline-flex">
                                                <FilterMenu />
                                            </div>
                                        </div>
                                        <div class="flex justify-end mb-4 gap-4 lg:hidden">
                                            <RoleFilter class="w-full" />
                                            <FilterMenu />
                                        </div>
                                        <DraftTable />
                                    </div>
                                </Match>
                                <Match
                                    when={
                                        currentDraftView().type === "analysis"
                                    }
                                >
                                    <div class="py-5 px-4 xl:px-8 h-full overflow-y-auto">
                                        <AnalysisView />
                                    </div>
                                </Match>
                                <Match
                                    when={currentDraftView().type === "builds"}
                                >
                                    <BuildsView />
                                </Match>
                            </Switch>
                        </div>
                    </Match>
                </Switch>
            </div>
        );
    };

    const mobileTab = () => {
        const current = currentDraftView();
        if (current.type === "draft") {
            return current.subType;
        }
        return undefined;
    };

    return (
        <div
            class="h-screen flex flex-col"
            style={{
                height: "calc(var(--vh, 1vh) * 100)",
            }}
        >
            <UpdateDialog />
            <Dialog open={showFAQ()} onOpenChange={setShowFAQ}>
                <FAQDialog />
            </Dialog>
            <header class="bg-primary px-1 py-0 border-b-2 border-neutral-700 flex justify-between">
                <h1 class="text-4xl sm:text-5xl mr-2 ml-1 mt-1 mb-[0.4rem] font-semibold tracking-wide">
                    DRAFTGAP
                </h1>
                <div class="flex items-center gap-4">
                    <div class="text-xs text-neutral-400 hidden md:flex flex-col text-right uppercase">
                        <span>Patch {dataset()?.version ?? ""}</span>
                        <span>Last updated {timeAgo()}</span>
                    </div>
                    <Dialog
                        open={showDownloadModal()}
                        onOpenChange={setShowDownloadModal}
                    >
                        <DesktopAppDialog />
                    </Dialog>
                    <LolClientStatusBadge
                        setShowDownloadModal={setShowDownloadModal}
                    />
                    <Dialog
                        open={showSettings()}
                        onOpenChange={setShowSettings}
                    >
                        <DialogTrigger>
                            <Icon path={cog_6Tooth} class="w-7 -mr-2" />
                        </DialogTrigger>
                        <SettingsDialog />
                    </Dialog>
                    <OptionsDropdownMenu
                        setShowSettings={setShowSettings}
                        setShowFAQ={setShowFAQ}
                    />
                </div>
            </header>
            {/* Desktop main */}
            <main
                class="h-full lg:grid overflow-hidden hidden"
                style={{
                    "grid-template-columns": "1fr 4fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
                <TeamSidebar team="ally" />

                <MainView />

                <TeamSidebar team="opponent" />
            </main>

            {/* Mobile main */}
            <main class="h-full overflow-hidden lg:hidden">
                <Switch>
                    <Match when={mobileTab() === "ally"}>
                        <TeamSidebar team="ally" />
                    </Match>
                    <Match when={mobileTab() === "opponent"}>
                        <TeamSidebar team="opponent" />
                    </Match>
                    <Match when={true}>
                        <MainView />
                    </Match>
                </Switch>
            </main>

            {/* Mobile footers */}
            <Show when={mobileTab() !== undefined}>
                <footer class="bg-primary px-4 py-2 border-t-2 border-neutral-700 flex justify-evenly lg:hidden gap-4">
                    <For each={["ally", "draft", "opponent"] as const}>
                        {(view) => (
                            <Badge
                                as="button"
                                onClick={() =>
                                    setCurrentDraftView({
                                        type: "draft",
                                        subType: view,
                                    })
                                }
                                theme={
                                    mobileTab() === view
                                        ? "primary"
                                        : "secondary"
                                }
                                class="w-1/3"
                            >
                                {view}
                            </Badge>
                        )}
                    </For>
                </footer>
            </Show>
        </div>
    );
};

export default App;
