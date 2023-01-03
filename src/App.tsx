import { Button } from "solid-headless";
import { Icon } from "solid-heroicons";
import {
    Component,
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
import { useTitle } from "./hooks/use-title";
import ResultScreen from "./components/resultscreen/ResultScreen";
import { LolClientStatusBadge } from "./components/draft/LolClientStatusBadge";
import { useLolClient } from "./context/LolClientContext";
import { UpdateModal } from "./components/Modals/UpdateModal";
import { OptionsPopover } from "./components/OptionsPopover";
import { FAQModal } from "./components/modals/FAQModal";
import { DownloadAppModal } from "./components/modals/DownloadAppModal";
import { Badge } from "./components/common/Badge";

const App: Component = () => {
    const { dataset, allyTeam, opponentTeam } = useDraft();
    const { startLolClientIntegration } = useLolClient();
    useTitle();

    const stopLolClientIntegration = startLolClientIntegration();
    onCleanup(stopLolClientIntegration);

    const [showSettings, setShowSettings] = createSignal(false);
    const [showFAQ, setShowFAQ] = createSignal(false);
    const [showDownloadModal, setShowDownloadModal] = createSignal(false);

    const [tab, setTab] = createSignal<"ally" | "opponent" | "draft">("ally");

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => s.championKey !== undefined
        );

    const MainView = () => {
        return (
            <div class="p-4 xl:px-8 bg-[#101010] flex-1 overflow-auto overflow-x-hidden h-full flex flex-col">
                <Switch>
                    <Match when={!dataset()}>
                        <div class="flex justify-center items-center h-full">
                            Loading
                        </div>
                    </Match>
                    <Match when={draftFinished()}>
                        <ResultScreen />
                    </Match>
                    <Match when={true}>
                        <div class="mb-4 flex space-x-4">
                            <Search />
                            <TeamSelector />
                            <RoleFilter className="hidden lg:inline-flex" />
                        </div>
                        <div class="flex justify-end mb-4 lg:hidden">
                            <RoleFilter />
                        </div>
                        <DraftTable />
                    </Match>
                </Switch>
            </div>
        );
    };

    return (
        <div class="h-screen flex flex-col">
            <SettingsModal
                isOpen={showSettings}
                setIsOpen={setShowSettings}
            ></SettingsModal>
            <UpdateModal />
            <FAQModal isOpen={showFAQ} setIsOpen={setShowFAQ} />
            <DownloadAppModal
                isOpen={showDownloadModal}
                setIsOpen={setShowDownloadModal}
            />
            <header class="bg-primary px-1 py-0 border-b-2 border-neutral-700 flex justify-between">
                <h1 class="text-6xl mr-2 ml-1">DRAFTGAP</h1>
                <div class="flex items-center gap-4">
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
                class="h-full lg:grid text-3xl overflow-hidden hidden"
                style={{
                    "grid-template-columns": "1fr 3fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
                <TeamSidebar team="ally" />

                <MainView />

                <TeamSidebar team="opponent" />
            </main>

            {/* Mobile main */}
            <main
                class="h-full text-xl overflow-hidden lg:hidden"
                style={{
                    "grid-template-columns": "1fr 3fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
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
