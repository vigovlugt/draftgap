import { useBuild } from "../../contexts/BuildContext";
import { displayNameByRole } from "@draftgap/core/src/models/Role";
import { BuildSummaryCards } from "../views/builds/BuildSummaryCards";
import { BuildMatchupTable } from "../views/builds/BuildMatchupTable";
import { tooltip } from "../../directives/tooltip";
import { useDataset } from "../../contexts/DatasetContext";
import { DialogContent, DialogTitle } from "../common/Dialog";
import { Show } from "solid-js";
// eslint-disable-next-line
tooltip;

export function BuildAnalysisDialog() {
    const { dataset } = useDataset();
    const { championKey, championRole, selectedEntity } = useBuild();

    const title = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    return dataset()!.statShardData[selected.id].name;
                }
                return dataset()!.runeData[selected.id].name;
            case "item":
                if (
                    selected.itemType === "sets" ||
                    selected.itemType === "startingSets"
                ) {
                    const items = selected.id
                        .split("_")
                        .map((id) => parseInt(id))
                        .reduce(
                            (acc, id) => {
                                if (acc[id] !== undefined) {
                                    acc[id] += 1;
                                } else {
                                    acc[id] = 1;
                                }

                                return acc;
                            },
                            {} as Record<number, number>,
                        );
                    return Object.entries(items)
                        .sort(
                            ([id1], [id2]) =>
                                dataset()!.itemData[parseInt(id2)].gold -
                                dataset()!.itemData[parseInt(id1)].gold,
                        )
                        .map(
                            ([id, amount]) =>
                                (amount > 1 ? `${amount} ` : "") +
                                dataset()!.itemData[parseInt(id)].name,
                        )
                        .join(" + ");
                }
                return dataset()!.itemData[selected.id as any].name;
            case "summonerSpells": {
                const [id1, id2] = selected.id.split("_");
                return (
                    dataset()!.summonerSpellData[+id1].name +
                    " + " +
                    dataset()!.summonerSpellData[+id2].name
                );
            }
            case "skills": {
                switch (selected.skillsType) {
                    case "order":
                        return selected.id.split("").join(" > ");
                    case "level":
                        return `${selected.id} level ${selected.level + 1}`;
                }
            }
        }
    };
    const subTitle = () =>
        dataset()!.championData[championKey()!].name +
        " " +
        displayNameByRole[championRole()!];

    const imageSrc = () => {
        const selected = selectedEntity()!;
        switch (selected.type) {
            case "rune":
                if (selected.runeType.startsWith("shard-")) {
                    const shard = dataset()!.statShardData[selected.id];
                    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmods${shard.key.toLocaleLowerCase()}icon.png`;
                }
                return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${dataset()!.runeData[
                    selectedEntity()!.id as any
                ].icon.toLowerCase()}`;
            case "item":
                if (
                    selected.itemType === "sets" ||
                    selected.itemType === "startingSets"
                ) {
                    const items = selected.id
                        .split("_")
                        .map((id) => parseInt(id))
                        .sort(
                            (a, b) =>
                                dataset()!.itemData[b].gold -
                                dataset()!.itemData[a].gold,
                        );

                    return `https://ddragon.leagueoflegends.com/cdn/${
                        dataset()!.version
                    }/img/item/${items[0]}.png`;
                }
                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/item/${selectedEntity()!.id}.png`;
            case "summonerSpells": {
                const id = selected.id.split("_")[0];
                const spell = dataset()!.summonerSpellData[+id];
                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/spell/${spell.id}.png`;
            }
            case "skills":
                return null;
        }
    };

    const imageSrc2 = () => {
        const selected = selectedEntity()!;

        switch (selected.type) {
            case "summonerSpells": {
                const id = selected.id.split("_")[1];
                const spell = dataset()!.summonerSpellData[+id];
                return `https://ddragon.leagueoflegends.com/cdn/${
                    dataset()!.version
                }/img/spell/${spell.id}.png`;
            }
        }
    };

    return (
        <DialogContent class="max-w-3xl">
            <div class="h-24 bg-[#101010] -m-6 mb-0" />
            <div class="flex gap-4 -mt-[62px] items-center">
                <Show when={imageSrc()}>
                    <div class="rounded-full border-primary border-8 bg-primary shrink-0 relative">
                        <img
                            src={imageSrc()!}
                            class="rounded-full w-20 h-20"
                            alt={title()}
                            style={{
                                "image-rendering": (() => {
                                    const selected = selectedEntity()!;
                                    if (
                                        selected.type === "rune" &&
                                        selected.runeType.startsWith("shard")
                                    ) {
                                        return "pixelated";
                                    }
                                    return undefined;
                                })(),
                                "clip-path": imageSrc2()
                                    ? "polygon(0% 0%, 100% 0%, 0% 100%, 0% 100%)"
                                    : undefined,
                            }}
                        />
                        <Show when={imageSrc2()}>
                            <img
                                src={imageSrc2()}
                                class="rounded-full w-20 h-20 absolute top-0 left-0"
                                alt={title()}
                                style={{
                                    "image-rendering": (() => {
                                        const selected = selectedEntity()!;
                                        if (
                                            selected.type === "rune" &&
                                            selected.runeType.startsWith(
                                                "shard",
                                            )
                                        ) {
                                            return "pixelated";
                                        }
                                        return undefined;
                                    })(),
                                    "clip-path":
                                        "polygon(100% 0%, 100% 100%, 0% 100%, 0% 100%)",
                                }}
                            />
                        </Show>
                    </div>
                </Show>
                <div class="flex flex-col justify-center w-full min-w-0">
                    <DialogTitle class="mb-1 truncate">{title()}</DialogTitle>
                    <span class="text-xl text-neutral-300 uppercase mb-[16px]">
                        {subTitle()}
                    </span>
                </div>
            </div>
            <BuildSummaryCards />
            <div class="w-full overflow-x-hidden -m-2 p-2">
                <h3
                    class="text-3xl uppercase ml-4"
                    // @ts-ignore
                    use:tooltip={{
                        content: <>Winrates of all {title()} matchups</>,
                    }}
                >
                    Matchups
                </h3>
                <p
                    class="text-neutral-500 uppercase mb-1 ml-4"
                    // @ts-ignore
                    use:tooltip={{
                        content: (
                            <>
                                The individual champion winrates have been
                                normalized (removed) before calculating the
                                matchup winrates.
                            </>
                        ),
                    }}
                >
                    Champion winrates normalized
                </p>
                <BuildMatchupTable class="ring-1 ring-white/10" />
            </div>
        </DialogContent>
    );
}
