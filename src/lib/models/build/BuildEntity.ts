export type BuildEntity =
    | {
          type: "rune";
          runeType: "primary" | "secondary";
          id: number;
      }
    | {
          type: "item";
          itemType: number | "boots";
          id: number;
      };

export type BuildEntityType = BuildEntity["type"];
