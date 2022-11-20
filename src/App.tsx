import { Button } from "solid-headless";
import { Icon } from "solid-heroicons";
import { Component, createSignal, Show } from "solid-js";
import { useDnd } from "./composables/use-dnd";
import DraftTable from "./components/DraftTable";
import { RoleFilter } from "./components/RoleFilter";
import { Search } from "./components/Search";
import { TeamSelector } from "./components/TeamSelector";
import { TeamSidebar } from "./components/TeamSidebar";
import { useDraft } from "./context/DraftContext";
import { cog_6Tooth } from "solid-heroicons/solid";
import SettingsModal from "./components/SettingsModal";
import { useTitle } from "./composables/use-title";

const App: Component = () => {
    const { dataset } = useDraft();
    useDnd();
    useTitle();

    const [showSettings, setShowSettings] = createSignal(false);

    return (
        <div class="h-screen flex flex-col">
            <SettingsModal
                isOpen={showSettings}
                setIsOpen={setShowSettings}
            ></SettingsModal>
            <header class="bg-primary p-2 py-0 border-b-2 border-neutral-700 flex justify-between">
                <h1 class="text-6xl mr-2">DRAFTGAP</h1>
                <Button
                    onClick={() => setShowSettings(!showSettings())}
                    class="mr-[10px]"
                >
                    <Icon path={cog_6Tooth} class="w-[24px]" />
                </Button>
            </header>
            <main
                class="h-full grid text-3xl overflow-hidden"
                style={{
                    "grid-template-columns": "1fr 3fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
                <TeamSidebar team="ally" />

                <div class="p-4 bg-black flex-1 overflow-auto overflow-x-hidden">
                    <Show
                        when={dataset()}
                        fallback={
                            <div class="flex justify-center items-center h-full">
                                Loading
                            </div>
                        }
                    >
                        {() => (
                            <>
                                <div class="mb-4 flex space-x-4">
                                    <Search />
                                    <TeamSelector />
                                    <RoleFilter />
                                </div>
                                <DraftTable />
                            </>
                        )}
                    </Show>
                </div>

                <TeamSidebar team="opponent" />
            </main>
        </div>
    );
};

export default App;
