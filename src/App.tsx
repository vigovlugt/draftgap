import { Button } from "solid-headless";
import { Icon } from "solid-heroicons";
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    For,
    Match,
    onCleanup,
    Switch,
} from "solid-js";
import DraftTable from "./components/draft/DraftTable";
import { RoleFilter } from "./components/draft/RoleFilter";
import { Search } from "./components/draft/Search";
import { TeamSelector } from "./components/draft/TeamSelector";
import { TeamSidebar } from "./components/draft/TeamSidebar";
import { useDraft } from "./context/DraftContext";
import { cog_6Tooth } from "solid-heroicons/solid";
import SettingsModal from "./components/modals/SettingsModal";
import AnalysisView from "./components/views/analysis/AnalysisView";
import { LolClientStatusBadge } from "./components/draft/LolClientStatusBadge";
import { useLolClient } from "./context/LolClientContext";
import { UpdateModal } from "./components/modals/UpdateModal";
import { OptionsPopover } from "./components/OptionsMenu";
import { FAQModal } from "./components/modals/FAQModal";
import { DownloadAppModal } from "./components/modals/DownloadAppModal";
import { Badge } from "./components/common/Badge";
import { FilterMenu } from "./components/draft/FilterMenu";
import { formatDistance } from "date-fns";
import { ViewTabs } from "./components/common/ViewTabs";
import { BuildsView } from "./components/views/builds/BuildsView";
import { useBuild } from "./context/BuildContext";

const App: Component = () => {
    const { config, dataset, tab, setTab, draftFinished } = useDraft();
    const { setBuildPick } = useBuild();
    const { startLolClientIntegration, stopLolClientIntegration } =
        useLolClient();

    const disableLeagueClientIntegration = createMemo(
        () => config().disableLeagueClientIntegration
    );

    createEffect(() => {
        if (disableLeagueClientIntegration()) {
            stopLolClientIntegration();
        } else {
            onCleanup(startLolClientIntegration());
        }
    });

    const [showSettings, setShowSettings] = createSignal(false);
    const [showFAQ, setShowFAQ] = createSignal(false);
    const [showDownloadModal, setShowDownloadModal] = createSignal(false);
    const [currentTab, setCurrentTab] = createSignal<"analysis" | "builds">(
        "analysis"
    );
    const onChangeTab = (tab: "analysis" | "builds") => {
        setCurrentTab(tab);
        setBuildPick(undefined);
        // TODO: IF LOLCLIENT INTEGRATION ENABLED, SET CURRENT BUILD TO OWN CHAMPION
    };

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
                    <Match when={dataset.state === "errored"}>
                        <div class="flex justify-center items-center h-full text-2xl text-red-500">
                            Error
                        </div>
                    </Match>
                    <Match when={dataset() === undefined}>
                        <div class="flex justify-center items-center h-full text-2xl">
                            Loading...
                        </div>
                    </Match>
                    <Match when={draftFinished()}>
                        <div class="flex flex-col overflow-hidden min-h-full flex-1">
                            <ViewTabs
                                tabs={[
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
                                ]}
                                selected={currentTab()}
                                onChange={onChangeTab}
                                className="xl:px-8"
                            ></ViewTabs>
                            <Switch>
                                <Match when={currentTab() === "analysis"}>
                                    <div class="py-5 px-4 xl:px-8 h-full overflow-y-auto">
                                        <AnalysisView />
                                    </div>
                                </Match>
                                <Match when={currentTab() === "builds"}>
                                    <BuildsView />
                                </Match>
                            </Switch>
                        </div>
                    </Match>
                    <Match when={dataset()}>
                        <div class="p-4 xl:px-8">
                            <div class="mb-4 flex gap-4">
                                <Search />
                                <TeamSelector />
                                <RoleFilter className="hidden lg:inline-flex" />
                                <div class="hidden lg:inline-flex">
                                    <FilterMenu />
                                </div>
                            </div>
                            <div class="flex justify-end mb-4 gap-4 lg:hidden">
                                <RoleFilter className="w-full" />
                                <FilterMenu />
                            </div>
                            <DraftTable />
                        </div>
                    </Match>
                </Switch>
            </div>
        );
    };

    return (
        <div
            class="h-screen flex flex-col"
            style={{
                height: "calc(var(--vh, 1vh) * 100)",
            }}
        >
            <SettingsModal
                isOpen={showSettings()}
                setIsOpen={setShowSettings}
                setFAQOpen={setShowFAQ}
            ></SettingsModal>
            <UpdateModal />
            <FAQModal isOpen={showFAQ()} setIsOpen={setShowFAQ} />
            <DownloadAppModal
                isOpen={showDownloadModal()}
                setIsOpen={setShowDownloadModal}
            />
            <header class="bg-primary px-1 py-0 border-b-2 border-neutral-700 flex justify-between">
                <h1 class="text-4xl sm:text-5xl mr-2 ml-1 mt-1 mb-[0.4rem] font-semibold tracking-wide">
                    DRAFTGAP
                </h1>
                <div class="flex items-center gap-4">
                    <div class="text-xs text-neutral-400 hidden md:flex flex-col text-right uppercase">
                        <span>Patch {dataset()?.version ?? ""}</span>
                        <span>Last updated {timeAgo()}</span>
                    </div>
                    <LolClientStatusBadge
                        setShowDownloadModal={setShowDownloadModal}
                    />
                    <Button onClick={() => setShowSettings(!showSettings())}>
                        <Icon path={cog_6Tooth} class="w-7 -mr-2" />
                    </Button>
                    <OptionsPopover
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
                    <Match when={tab() === "ally"}>
                        <TeamSidebar team="ally" />
                    </Match>
                    <Match when={tab() === "draft"}>
                        <MainView />
                    </Match>
                    <Match when={tab() === "opponent"}>
                        <TeamSidebar team="opponent" />
                    </Match>
                </Switch>
            </main>

            {/* Mobile footers */}
            <footer class="bg-primary px-4 py-2 border-t-2 border-neutral-700 flex justify-evenly lg:hidden gap-4">
                <For each={["ally", "draft", "opponent"] as const}>
                    {(view) => (
                        <Badge
                            as="button"
                            onClick={() => setTab(view)}
                            theme={tab() === view ? "primary" : "secondary"}
                            class="w-1/3"
                        >
                            {view}
                        </Badge>
                    )}
                </For>
            </footer>
        </div>
    );
};

export default App;
