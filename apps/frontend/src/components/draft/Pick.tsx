import { Icon } from "solid-heroicons";
import { openUrl } from "@tauri-apps/plugin-opener";
import { For, Show } from "solid-js";
import {
    getPickedChampionKey,
    getVisibleChampionKey,
    useDraft,
} from "../../contexts/DraftContext";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { PickOptions, PickOptionsContextMenuContent } from "./PickOptions";
import { ContextMenu, ContextMenuTrigger } from "../common/ContextMenu";
import { lockOpen, lockClosed } from "solid-heroicons/solid-mini";
import { Role } from "@draftgap/core/src/models/Role";
import { formatPercentage } from "../../utils/rating";
import { tooltip } from "../../directives/tooltip";
import { useTooltip } from "../../contexts/TooltipContext";
import { linkByStatsSite } from "../../utils/sites";
import { useUser } from "../../contexts/UserContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { championName } from "../../utils/i18n";
import { useMedia } from "../../hooks/useMedia";
// eslint-disable-next-line
tooltip;

type Props = {
    team: "ally" | "opponent";
    index: number;
};

export function Pick(props: Props) {
    const { config } = useUser();
    const { allyTeam, opponentTeam, selection, select, pickChampion } =
        useDraft();

    const { isDesktop } = useMedia();

    const team = () => (props.team === "ally" ? allyTeam : opponentTeam);

    const {
        allyTeamComp,
        opponentTeamComp,
        allyTeamData,
        opponentTeamData,
        setAnalysisPick,
        analyzeHovers,
    } = useDraftAnalysis();

    const { setPopoverVisible } = useTooltip();
    const picks = () => (props.team === "ally" ? allyTeam : opponentTeam);
    const championData = () =>
        props.team === "ally" ? allyTeamData() : opponentTeamData();
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const pick = () => picks()[props.index];
    const teamCompRole = () =>
        [...(teamComp()?.entries() ?? [])].find(
            (e) => e[1] === pick().championKey,
        )?.[0];

    const isSelected = () =>
        selection.type === "pick" &&
        selection.team === props.team &&
        selection.index === props.index;

    const champion = () => {
        const key = getVisibleChampionKey(pick(), analyzeHovers());
        return key ? championData().get(key) : undefined;
    };

    function setRole(role: Role | undefined) {
        pickChampion(
            props.team,
            props.index,
            getPickedChampionKey(pick()),
            role,
        );
    }

    const keyDownListener = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }

        if ((e.target as HTMLElement).tagName === "INPUT") {
            return;
        }

        if (e.key === "b") {
            if (!champion()) {
                return;
            }
            e.preventDefault();

            const link = linkByStatsSite(
                config.defaultStatsSite,
                champion()!.id,
                [...teamComp().entries()].find(
                    ([, value]) => value === pick().championKey,
                )![0] as Role,
            );
            if (isDesktop) {
                openUrl(link);
            } else {
                window.open(link, "_blank");
            }
        } else if (
            e.key === "r" ||
            e.key === "Backspace" ||
            e.key === "Delete"
        ) {
            e.preventDefault();
            pickChampion(props.team, props.index, undefined, undefined);
        } else if (e.key === "f") {
            setAnalysisPick({
                team: props.team,
                championKey: team()[props.index].championKey!,
            });
        }
    };

    function onMouseOver() {
        document.addEventListener("keydown", keyDownListener);
    }

    function onMouseOut() {
        document.removeEventListener("keydown", keyDownListener);
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger
                as="div"
                class="group/pick flex-1 relative border-t border-neutral-700 hover:bg-neutral-800/50 transition-colors duration-150 ease-in-out"
                classList={{
                    "bg-white/5!": isSelected(),
                }}
                onClick={() => select(props.team, props.index)}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                <Show when={!champion()}>
                    <span class="absolute top-2 left-3 uppercase text-2xl leading-none text-neutral-500">
                        PICK {props.index + 1}
                    </span>
                </Show>

                <Show when={champion()}>
                    <>
                        <div
                            class="absolute top-0 bottom-0 left-0 h-full w-full"
                            classList={{
                                "animate-pulse": pick().hover,
                            }}
                            style={{
                                "background-image": `linear-gradient(to bottom, rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%),
                                url(https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${
                                    champion()!.id === "Fiddlesticks"
                                        ? "FiddleSticks"
                                        : champion()!.id
                                }_0.jpg)`,
                                "background-position": "center 20%",
                                "background-size": "cover",
                            }}
                        />

                        <span class="absolute top-2 left-3 uppercase text-2xl leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {championName(champion()!, config)}
                        </span>

                        <div
                            class="absolute bottom-0 left-0 right-0 flex justify-end overflow-x-auto pt-1 overflow-y-hidden"
                            classList={{
                                "bottom-1": pick().role !== undefined,
                            }}
                        >
                            <For
                                each={[
                                    ...(champion()?.probabilityByRole.entries() ??
                                        []),
                                ]
                                    .filter(([, prob]) => prob > 0.05)
                                    .sort(
                                        ([, probA], [, probB]) => probB - probA,
                                    )}
                            >
                                {([role, probability]) => (
                                    <div
                                        class="flex flex-col items-center relative group mx-[0.4rem]"
                                        onClick={(e) => {
                                            // Don't select the slot for replacement
                                            e.stopPropagation();
                                            setPopoverVisible(false);
                                            setRole(
                                                pick().role === undefined
                                                    ? role
                                                    : undefined,
                                            );
                                        }}
                                        // @ts-ignore
                                        use:tooltip={{
                                            content: (
                                                <>
                                                    {pick().role !== undefined
                                                        ? "The champion is locked in this position, to choose an other position, click to unlock"
                                                        : "Click to lock the champion in this position, the current estimated position is highlighted"}
                                                </>
                                            ),
                                        }}
                                    >
                                        <div class="text-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                            <RoleIcon
                                                role={role}
                                                class="h-8 lg:h-10"
                                                classList={{
                                                    "opacity-50":
                                                        teamCompRole() !== role,
                                                }}
                                            />
                                        </div>
                                        <Show when={pick().role === undefined}>
                                            <div
                                                class="text-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                                classList={{
                                                    "opacity-75":
                                                        teamCompRole() !== role,
                                                }}
                                                // @ts-ignore
                                                use:tooltip={{
                                                    content: (
                                                        <>
                                                            The probability of
                                                            this champion being
                                                            played in this
                                                            position
                                                        </>
                                                    ),
                                                }}
                                            >
                                                {formatPercentage(
                                                    probability,
                                                    1,
                                                )}
                                            </div>
                                        </Show>
                                        <Icon
                                            path={
                                                pick().role === undefined
                                                    ? lockOpen
                                                    : lockClosed
                                            }
                                            class="absolute -top-1 -right-1 w-[20px]"
                                            classList={{
                                                "opacity-0 group-hover:opacity-100 group-hover:text-neutral-300":
                                                    pick().role === undefined,
                                            }}
                                            style={{
                                                filter:
                                                    pick().role !== undefined
                                                        ? "drop-shadow(2px 0 0 #191919) drop-shadow(-2px 0 0 #191919) drop-shadow(0 2px 0 #191919) drop-shadow(0 -2px 0 #191919)"
                                                        : undefined,
                                            }}
                                        />
                                    </div>
                                )}
                            </For>
                        </div>
                    </>
                </Show>

                <Show when={isSelected()}>
                    <div
                        class="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none"
                        classList={{
                            "left-0": props.team === "ally",
                            "right-0": props.team === "opponent",
                        }}
                    />
                </Show>

                <PickOptions team={props.team} index={props.index} />
            </ContextMenuTrigger>
            <PickOptionsContextMenuContent
                team={props.team}
                index={props.index}
            />
        </ContextMenu>
    );
}
