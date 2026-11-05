import { For, Show, createSignal } from "solid-js";
import { Team } from "@draftgap/core/src/models/Team";
import { ratingToWinrate } from "@draftgap/core/src/rating/ratings";
import { useDraft } from "../../contexts/DraftContext";
import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { useDataset } from "../../contexts/DatasetContext";
import { getRatingClass } from "../../utils/rating";
import { RoleIcon } from "../icons/roles/RoleIcon";
import { CountUp } from "../CountUp";
import { DropdownMenu, DropdownMenuTrigger } from "../common/DropdownMenu";
import { DamageDistributionBar } from "./DamageDistributionBar";
import { PickOptionsContent } from "./PickOptions";
import { TeamOptions } from "./TeamOptions";

function MobilePickSlot(props: { team: Team; index: number }) {
    const { allyTeam, opponentTeam, selection, select } = useDraft();
    const { allyTeamComp, opponentTeamComp, analyzeHovers } =
        useDraftAnalysis();
    const { dataset } = useDataset();
    const [menuOpen, setMenuOpen] = createSignal(false);

    const pick = () =>
        (props.team === "ally" ? allyTeam : opponentTeam)[props.index];
    const teamComp = () =>
        props.team === "ally" ? allyTeamComp() : opponentTeamComp();

    const championKey = () =>
        pick().championKey ?? (analyzeHovers() ? pick().hoverKey : undefined);
    const champion = () =>
        championKey() ? dataset()?.championData[championKey()!] : undefined;
    const role = () =>
        [...(teamComp()?.entries() ?? [])].find(
            (e) => e[1] === championKey(),
        )?.[0];

    const isSelected = () =>
        selection.team === props.team && selection.index === props.index;

    return (
        <DropdownMenu
            open={menuOpen()}
            onOpenChange={(open) =>
                setMenuOpen(open && pick().championKey !== undefined)
            }
        >
            <DropdownMenuTrigger
                as="div"
                role="button"
                class="relative flex-1 aspect-square max-w-14 rounded-sm overflow-hidden border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center"
                classList={{
                    "border-white!": isSelected(),
                }}
                onClick={() => {
                    if (!pick().championKey) select(props.team, props.index);
                }}
            >
                <Show
                    when={champion()}
                    fallback={
                        <span class="text-neutral-600 text-lg">
                            {props.index + 1}
                        </span>
                    }
                >
                    <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${
                            dataset()!.version
                        }/img/champion/${champion()!.id}.png`}
                        alt={champion()!.name}
                        class="absolute inset-0 w-full h-full object-cover scale-110"
                        style={{
                            filter: pick().championKey
                                ? undefined
                                : "grayscale(1)",
                        }}
                    />
                    <Show when={role() !== undefined}>
                        <div class="absolute bottom-0 right-0 bg-black/70 rounded-tl-sm p-px">
                            <RoleIcon
                                role={role()!}
                                class="h-3.5 w-3.5"
                                classList={{
                                    "opacity-60": pick().role === undefined,
                                }}
                            />
                        </div>
                    </Show>
                </Show>
            </DropdownMenuTrigger>
            <PickOptionsContent team={props.team} index={props.index} />
        </DropdownMenu>
    );
}

function MobileTeamRow(props: { team: Team }) {
    const { allyDraftAnalysis, opponentDraftAnalysis } = useDraftAnalysis();

    const rating = () =>
        props.team === "ally"
            ? allyDraftAnalysis()?.totalRating
            : opponentDraftAnalysis()?.totalRating;

    return (
        <div class="relative flex items-center gap-1.5 pt-1.5 pb-1">
            <DamageDistributionBar team={props.team} />
            <div class="flex flex-col w-12 shrink-0 leading-tight uppercase">
                <span class="text-xs text-neutral-400">{props.team}</span>
                <CountUp
                    value={rating() ? ratingToWinrate(rating()!) : 0.5}
                    formatFn={(value) => (value * 100).toFixed(1)}
                    class={`${getRatingClass(
                        rating() ?? 0,
                    )} text-lg transition-colors duration-500`}
                    style={{
                        "font-variant-numeric": "tabular-nums",
                    }}
                />
            </div>
            <div class="flex flex-1 gap-1 justify-between">
                <For each={[0, 1, 2, 3, 4]}>
                    {(index) => (
                        <MobilePickSlot team={props.team} index={index} />
                    )}
                </For>
            </div>
            <TeamOptions team={props.team} class="static shrink-0 -mr-1" />
        </div>
    );
}

export function MobileTeamStrip() {
    return (
        <div class="flex flex-col gap-1 mb-4 lg:hidden">
            <MobileTeamRow team="ally" />
            <MobileTeamRow team="opponent" />
        </div>
    );
}
