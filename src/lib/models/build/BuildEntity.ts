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
      }
    | {
          type: "item";
          itemType: "startingSets" | "sets";
          id: string;
      };

export type BuildEntityType = BuildEntity["type"];
