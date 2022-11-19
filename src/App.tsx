import { batch, Component, createEffect, Show } from "solid-js";
import DraftTable from "./components/DraftTable";
import { TeamSidebar } from "./components/TeamSidebar";
import { DraftProvider, useDraft } from "./context/DraftContext";

const App: Component = () => {
    const { dataset, pickChampion, allyTeamData } = useDraft()!;

    return (
        <div class="h-screen flex flex-col">
            <header class="bg-primary p-2 py-0 border-b-2 border-neutral-700">
                <h1 class="text-6xl">DRAFTGAP</h1>
            </header>
            <main
                class="h-full grid text-3xl overflow-hidden"
                style={{
                    "grid-template-columns": "1fr 3fr 1fr",
                    "grid-template-rows": "100%",
                }}
            >
                <TeamSidebar team="ally" />

                <div class="p-4 bg-black flex-1 overflow-auto">
                    <Show
                        when={dataset()}
                        fallback={
                            <div class="flex justify-center items-center h-full">
                                Loading
                            </div>
                        }
                    >
                        {() => <DraftTable />}
                    </Show>
                </div>

                <TeamSidebar team="opponent" />
            </main>
        </div>
    );
};

export default App;
