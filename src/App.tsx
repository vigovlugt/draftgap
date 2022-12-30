import { Button } from "solid-headless";
import { Icon } from "solid-heroicons";
import { Component, createSignal, Match, onCleanup, Switch } from "solid-js";
import { useDnd } from "./hooks/use-dnd";
import DraftTable from "./components/draft/DraftTable";
import { RoleFilter } from "./components/draft/RoleFilter";
import { Search } from "./components/draft/Search";
import { TeamSelector } from "./components/draft/TeamSelector";
import { TeamSidebar } from "./components/draft/TeamSidebar";
import { useDraft } from "./context/DraftContext";
import { cog_6Tooth } from "solid-heroicons/solid";
import SettingsModal from "./components/SettingsModal";
import { useTitle } from "./hooks/use-title";
import ResultScreen from "./components/resultscreen/ResultScreen";
import { LolClientStatusBadge } from "./components/LolClientStatusBadge";
import { useLolClient } from "./context/LolClientContext";

const App: Component = () => {
    const { dataset, allyTeam, opponentTeam } = useDraft();
    const { startLolClientIntegration } = useLolClient();
    useDnd();
    useTitle();

    const stopLolClientIntegration = startLolClientIntegration();
    onCleanup(stopLolClientIntegration);

    const [showSettings, setShowSettings] = createSignal(false);

    const draftFinished = () =>
        [...allyTeam, ...opponentTeam].every(
            (s) => s.championKey !== undefined
        );

    return (
        <div class="h-screen flex flex-col">
            <SettingsModal
                isOpen={showSettings}
                setIsOpen={setShowSettings}
            ></SettingsModal>
            <header class="bg-primary p-2 py-0 border-b-2 border-neutral-700 flex justify-between">
                <h1 class="text-6xl mr-2">DRAFTGAP</h1>
                <div class="flex items-center gap-4">
                    <LolClientStatusBadge />
                    <Button
                        onClick={() => setShowSettings(!showSettings())}
                        class="mr-[10px]"
                    >
                        <Icon path={cog_6Tooth} class="w-[24px]" />
                    </Button>
                </div>
            </header>
            <main
                class="h-full grid text-3xl overflow-hidden"
                style={{
                    "grid-template-columns": "1fr 3fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
                <TeamSidebar team="ally" />

                <div class="p-4 bg-[#101010] flex-1 overflow-auto overflow-x-hidden">
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
                                <RoleFilter />
                            </div>
                            <DraftTable />
                        </Match>
                    </Switch>
                </div>

                <TeamSidebar team="opponent" />
            </main>
        </div>
    );
};

export default App;
