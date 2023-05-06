export type BuildEntity =
    | {
          type: "rune";
          runeType:
              | "primary"
              | "secondary"
              | "shard-offense"
              | "shard-defense"
              | "shard-flex";
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
