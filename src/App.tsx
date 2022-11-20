import { useDragDropContext } from "@thisbeyond/solid-dnd";
import {
    batch,
    Component,
    createEffect,
    createSignal,
    onCleanup,
    Show,
} from "solid-js";
import { useDnd } from "./components/composables/use-dnd";
import DraftTable from "./components/DraftTable";
import { RoleFilter } from "./components/RoleFilter";
import { Search } from "./components/Search";
import { TeamSidebar } from "./components/TeamSidebar";
import { DraftProvider, useDraft } from "./context/DraftContext";
import { Role } from "./lib/models/Role";

const App: Component = () => {
    const { dataset } = useDraft();
    useDnd();

    const [search, setSearch] = createSignal("");
    const [roleFilter, setRoleFilter] = createSignal<Role>();

    return (
        <div class="h-screen flex flex-col">
            <header class="bg-primary p-2 py-0 border-b-2 border-neutral-700 flex">
                <h1 class="text-6xl mr-2">DRAFTGAP</h1>
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
                                    <Search
                                        search={search}
                                        setSearch={setSearch}
                                    />
                                    <RoleFilter
                                        roleFilter={roleFilter}
                                        setRoleFilter={setRoleFilter}
                                    />
                                </div>
                                <DraftTable
                                    search={search}
                                    roleFilter={roleFilter}
                                />
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
