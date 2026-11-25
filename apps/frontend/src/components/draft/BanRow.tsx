import { For, Show, createSignal } from "solid-js";
import { Icon } from "solid-heroicons";
import { noSymbol, trash } from "solid-heroicons/solid-mini";
import { Team } from "@draftgap/core/src/models/Team";
import { useDraft } from "../../contexts/DraftContext";
import { useDataset } from "../../contexts/DatasetContext";
import { useUser } from "../../contexts/UserContext";
import { championName } from "../../utils/i18n";
import { cn } from "../../utils/style";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuIcon,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../common/DropdownMenu";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuTrigger,
} from "../common/ContextMenu";

type Props = {
    team: Team;
    class?: string;
};

export function BanRow(props: Props) {
    return (
        <div class={cn("flex gap-1", props.class)}>
            <For each={[0, 1, 2, 3, 4]}>
                {(index) => <BanSlot team={props.team} index={index} />}
            </For>
        </div>
    );
}

function BanSlot(props: { team: Team; index: number }) {
    const { bans, selection, select, resetBan } = useDraft();
    const { dataset } = useDataset();
    const { config } = useUser();
    const [menuOpen, setMenuOpen] = createSignal(false);

    const championKey = () => bans[props.team][props.index];
    const champion = () =>
        championKey() ? dataset()?.championData[championKey()!] : undefined;

    const isSelected = () =>
        selection.type === "ban" &&
        selection.team === props.team &&
        selection.index === props.index;

    return (
        <ContextMenu>
            <ContextMenuTrigger
                as="div"
                class="w-11 min-w-0 shrink"
                disabled={!champion()}
            >
                <DropdownMenu
                    open={menuOpen()}
                    onOpenChange={(open) =>
                        setMenuOpen(open && championKey() !== undefined)
                    }
                >
                    <DropdownMenuTrigger
                        as="div"
                        role="button"
                        aria-label={
                            champion()
                                ? `Ban ${props.index + 1}: ${champion()!.name}`
                                : `Ban ${props.index + 1}`
                        }
                        class="relative w-full aspect-square rounded-sm overflow-hidden border border-neutral-700 bg-neutral-900 flex items-center justify-center hover:border-neutral-500 transition-colors duration-150"
                        classList={{
                            "border-white! bg-neutral-700": isSelected(),
                        }}
                        onClick={() => {
                            if (!championKey()) {
                                select(props.team, props.index, {
                                    type: "ban",
                                });
                            }
                        }}
                    >
                        <Show
                            when={champion()}
                            fallback={
                                <Icon
                                    path={noSymbol}
                                    class="w-1/2 text-neutral-600"
                                    classList={{
                                        "text-neutral-300!": isSelected(),
                                    }}
                                />
                            }
                        >
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/${
                                    dataset()!.version
                                }/img/champion/${champion()!.id}.png`}
                                alt={champion()!.name}
                                class="absolute inset-0 w-full h-full object-cover scale-110"
                                style={{ filter: "grayscale(1)" }}
                            />
                            <div
                                class="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(to top right, transparent calc(50% - 1px), #dc2626 calc(50% - 1px), #dc2626 calc(50% + 1px), transparent calc(50% + 1px))",
                                }}
                            />
                        </Show>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Show when={champion()}>
                            <DropdownMenuLabel>
                                {championName(champion()!, config)}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </Show>
                        <DropdownMenuItem
                            onSelect={() => resetBan(props.team, props.index)}
                        >
                            <DropdownMenuIcon path={trash} />
                            <span>Remove ban</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <Show when={champion()}>
                    <DropdownMenuLabel>
                        {championName(champion()!, config)}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                </Show>
                <DropdownMenuItem
                    onSelect={() => resetBan(props.team, props.index)}
                >
                    <DropdownMenuIcon path={trash} />
                    <span>Remove ban</span>
                </DropdownMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
