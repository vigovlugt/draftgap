import { fetch } from "undici";

export async function getVersions() {
    const res = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const json = (await res.json()) as string[];

    return json;
}

export async function getChampions(version: string) {
    const res = await fetch(
        `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    const json = (await res.json()) as any;

    return Object.values(json.data).map((v: any) => ({
        id: v.id,
        key: v.key,
        name: v.name,
    }));
}
