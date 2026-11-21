import { describe, expect, test } from "bun:test";
import { getBanSuggestions } from "./bans";
import { Dataset } from "../models/dataset/Dataset";
import { defaultChampionRoleData } from "../models/dataset/ChampionRoleData";
import { Role } from "../models/Role";
import { Suggestion } from "./suggestions";
import { DraftResult } from "./analysis";

function createDataset(games: Record<string, Partial<Record<Role, number>>>) {
    const championData: Dataset["championData"] = {};
    for (const [key, gamesByRole] of Object.entries(games)) {
        const statsByRole = Object.fromEntries(
            [0, 1, 2, 3, 4].map((role) => {
                const data = defaultChampionRoleData();
                data.games = gamesByRole[role as Role] ?? 0;
                data.wins = data.games / 2;
                return [role, data];
            }),
        ) as Dataset["championData"][string]["statsByRole"];

        championData[key] = {
            id: key,
            key,
            name: key,
            i18n: {},
            statsByRole,
        };
    }

    return {
        version: "test",
        date: "",
        championData,
        itemData: {},
        runeData: {},
        runePathData: {},
        statShardData: {},
        summonerSpellData: {},
    } satisfies Dataset;
}

function suggestion(
    championKey: string,
    role: Role,
    winrate: number,
): Suggestion {
    return {
        championKey,
        role,
        draftResult: { winrate } as DraftResult,
    };
}

describe("getBanSuggestions", () => {
    const dataset = createDataset({
        popular: { [Role.Middle]: 1000 },
        pocket: { [Role.Middle]: 20 },
        counter: { [Role.Middle]: 500 },
        filler: { [Role.Middle]: 1000 },
    });

    test("weighs winrate delta by pickrate", () => {
        const dataset = createDataset({
            a: { [Role.Middle]: 750 },
            b: { [Role.Middle]: 250 },
        });
        const [a, b] = getBanSuggestions(
            dataset,
            [
                suggestion("a", Role.Middle, 0.52),
                suggestion("b", Role.Middle, 0.48),
            ],
            new Set(),
        );

        expect(a!.threats[0]!.probability).toBeCloseTo(0.75);
        expect(a!.threats[0]!.delta).toBeCloseTo(0.01);
        expect(a!.score).toBeCloseTo(0.75 * 0.01);

        expect(b!.threats[0]!.threat).toBeCloseTo(0.25 * -0.03);
        expect(b!.score).toBe(0);
    });

    test("renormalizes probabilities without unavailable champions", () => {
        const dataset = createDataset({
            a: { [Role.Top]: 500 },
            b: { [Role.Top]: 500 },
        });
        const bans = getBanSuggestions(
            dataset,
            [suggestion("a", Role.Top, 0.55), suggestion("b", Role.Top, 0.5)],
            new Set(["a"]),
        );

        expect(bans.map((b) => b.championKey)).toEqual(["b"]);
        expect(bans[0]!.threats[0]!.probability).toBeCloseTo(1);
    });

    test("only lists roles with a meaningful threat, but scores all", () => {
        const dataset = createDataset({
            flex: { [Role.Middle]: 1000, [Role.Top]: 1 },
            mid: { [Role.Middle]: 1000 },
            top: { [Role.Top]: 1000 },
        });
        const [flex] = getBanSuggestions(
            dataset,
            [
                suggestion("flex", Role.Middle, 0.55),
                suggestion("mid", Role.Middle, 0.5),
                suggestion("flex", Role.Top, 0.52),
                suggestion("top", Role.Top, 0.5),
            ],
            new Set(),
        );

        expect(flex!.threats.map((t) => t.role)).toEqual([Role.Middle]);
        expect(flex!.score).toBeGreaterThan(flex!.threats[0]!.threat);
    });

    test("ranks strong popular champions over strong rare champions", () => {
        const bans = getBanSuggestions(
            dataset,
            [
                suggestion("popular", Role.Middle, 0.53),
                suggestion("pocket", Role.Middle, 0.56),
                suggestion("filler", Role.Middle, 0.49),
            ],
            new Set(),
        );

        expect(bans[0]!.championKey).toBe("popular");
    });

    test("draft context changes the best ban", () => {
        const bans = getBanSuggestions(
            dataset,
            [
                suggestion("popular", Role.Middle, 0.5),
                suggestion("counter", Role.Middle, 0.58),
                suggestion("filler", Role.Middle, 0.49),
            ],
            new Set(),
        );

        expect(bans[0]!.championKey).toBe("counter");
    });

    test("filters by role", () => {
        const dataset = createDataset({
            top: { [Role.Top]: 1000 },
            mid: { [Role.Middle]: 1000 },
            mid2: { [Role.Middle]: 1000 },
        });
        const bans = getBanSuggestions(
            dataset,
            [
                suggestion("top", Role.Top, 0.6),
                suggestion("mid", Role.Middle, 0.52),
                suggestion("mid2", Role.Middle, 0.5),
            ],
            new Set(),
            Role.Middle,
        );

        expect(bans.map((b) => b.championKey)).toEqual(["mid", "mid2"]);
    });
});
