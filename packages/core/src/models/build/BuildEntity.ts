import { Skill, SkillOrder } from "./BuildDataset";

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
      }
    | {
          type: "summonerSpells";
          id: string;
      }
    | ({
          type: "skills";
      } & (
          | {
                skillsType: "order";
                id: SkillOrder;
            }
          | {
                skillsType: "level";
                level: number;
                id: Skill;
            }
      ));

export type BuildEntityType = BuildEntity["type"];
