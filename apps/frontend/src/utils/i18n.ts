import { ChampionData } from "@draftgap/core/src/models/dataset/ChampionData";
import { DraftGapConfig } from "@draftgap/core/src/models/user/Config";

export function championName(champion: ChampionData, config: DraftGapConfig) {
    if (config.language === "en_US") {
        return champion.name;
    }

    return champion.i18n[config.language]?.name ?? champion.name;
}
