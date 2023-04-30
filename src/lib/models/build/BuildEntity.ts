export type BuildEntity = {
    type: "rune";
    runeType: "primary" | "secondary";
    id: number;
};

export type BuildEntityType = BuildEntity["type"];
