import { Icon } from "solid-heroicons";
import { questionMarkCircle } from "solid-heroicons/solid-mini";
import { Show } from "solid-js";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import { Switch } from "../common/Switch";
import { RiskLevel } from "@draftgap/core/src/risk/risk-level";
import { useUser } from "../../contexts/UserContext";
import { useMedia } from "../../hooks/useMedia";
import {
    DraftTablePlacement,
    StatsSite,
} from "@draftgap/core/src/models/user/Config";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../common/Dialog";
import { FAQDialog } from "./FAQDialog";
import { riskLevelName, t } from "../../utils/i18n";

export default function SettingsDialog() {
    const { isDesktop } = useMedia();
    const { config, setConfig } = useUser();

    const riskLevelOptions: ButtonGroupOption<RiskLevel>[] = RiskLevel.map(
        (level) => ({
            value: level,
            label: riskLevelName(config, level),
        }),
    );

    const draftTablePlacementOptions = [
        {
            value: DraftTablePlacement.Bottom,
            label: t(config, "bottom"),
        },
        {
            value: DraftTablePlacement.InPlace,
            label: t(config, "inPlace"),
        },
        {
            value: DraftTablePlacement.Hidden,
            label: t(config, "hidden"),
        },
    ];

    const statsSiteOptions = [
        {
            value: "lolalytics",
            label: "lolalytics",
        },
        {
            value: "u.gg",
            label: "u.gg",
        },
        {
            value: "op.gg",
            label: "op.gg",
        },
    ] as const;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t(config, "settings")}</DialogTitle>
            </DialogHeader>
            <div>
                <h3 class="text-3xl uppercase">{t(config, "draft")}</h3>
                <div class="flex space-x-16 items-center justify-between mt-2">
                    <span class="text-lg uppercase">
                        {t(config, "ignoreChampionWinrates")}
                    </span>
                    <Switch
                        checked={config.ignoreChampionWinrates}
                        onChange={() =>
                            setConfig({
                                ignoreChampionWinrates:
                                    !config.ignoreChampionWinrates,
                            })
                        }
                    />
                </div>
                <div class="flex items-center mt-1 mb-1 gap-1">
                    <span class="text-lg uppercase block">
                        {t(config, "riskLevel")}
                    </span>
                    <Dialog>
                        <DialogTrigger>
                            <Icon
                                path={questionMarkCircle}
                                class="w-5 inline text-neutral-400 -mt-1"
                            />
                        </DialogTrigger>
                        <FAQDialog />
                    </Dialog>
                </div>
                <ButtonGroup
                    options={riskLevelOptions}
                    selected={config.riskLevel}
                    size="sm"
                    onChange={(value: RiskLevel) =>
                        setConfig({
                            riskLevel: value,
                        })
                    }
                />
            </div>
            <div>
                <h3 class="text-3xl uppercase">{t(config, "ui")}</h3>
                <div class="flex space-x-8 items-center justify-between mt-2">
                    <span class="text-lg uppercase">
                        {t(config, "placeFavouritesAtTop")}
                    </span>
                    <Switch
                        checked={config.showFavouritesAtTop}
                        onChange={() =>
                            setConfig({
                                showFavouritesAtTop:
                                    !config.showFavouritesAtTop,
                            })
                        }
                    />
                </div>

                <Show when={isDesktop}>
                    <div class="flex flex-col gap-1 mt-2">
                        <span class="text-lg uppercase">
                            {t(config, "placeBannedChampionSuggestionsAt")}
                        </span>
                        <ButtonGroup
                            options={draftTablePlacementOptions}
                            selected={config.banPlacement}
                            size="sm"
                            onChange={(v) =>
                                setConfig({
                                    banPlacement: v,
                                })
                            }
                        />
                    </div>
                    <div class="flex flex-col gap-1 mt-2">
                        <span class="text-lg uppercase">
                            {t(config, "placeUnownedChampionSuggestionsAt")}
                        </span>
                        <ButtonGroup
                            options={draftTablePlacementOptions}
                            size="sm"
                            selected={config.unownedPlacement}
                            onChange={(v) =>
                                setConfig({
                                    unownedPlacement: v,
                                })
                            }
                        />
                    </div>
                </Show>

                <div class="flex space-x-8 items-center justify-between mt-2">
                    <span class="text-lg uppercase">
                        {t(config, "showAdvancedWinrates")}
                    </span>
                    <Switch
                        checked={config.showAdvancedWinrates}
                        onChange={() =>
                            setConfig({
                                showAdvancedWinrates:
                                    !config.showAdvancedWinrates,
                            })
                        }
                    />
                </div>
            </div>

            <Show when={isDesktop}>
                <div>
                    <h3 class="text-3xl uppercase">
                        {t(config, "leagueClient")}
                    </h3>
                    <div class="flex space-x-16 items-center justify-between mt-2">
                        <span class="text-lg uppercase">
                            {t(config, "disableLeagueClientIntegration")}
                        </span>
                        <Switch
                            checked={config.disableLeagueClientIntegration}
                            onChange={() =>
                                setConfig({
                                    disableLeagueClientIntegration:
                                        !config.disableLeagueClientIntegration,
                                })
                            }
                        />
                    </div>
                    <div class="flex space-x-16 items-center justify-between mt-2">
                        <span class="text-lg uppercase">
                            {t(config, "syncChampionSelectionToLeagueClient")}
                        </span>
                        <Switch
                            checked={config.syncChampionSelectionToLeagueClient}
                            onChange={() =>
                                setConfig({
                                    syncChampionSelectionToLeagueClient:
                                        !config.syncChampionSelectionToLeagueClient,
                                })
                            }
                        />
                    </div>
                </div>
            </Show>

            <div>
                <h3 class="text-3xl uppercase">{t(config, "misc")}</h3>
                <div class="flex flex-col gap-1 mt-2">
                    <span class="text-lg uppercase">
                        {t(config, "favouriteBuildsSite")}
                    </span>
                    <ButtonGroup
                        options={statsSiteOptions}
                        selected={config.defaultStatsSite}
                        size="sm"
                        onChange={(value: StatsSite) =>
                            setConfig({
                                defaultStatsSite: value,
                            })
                        }
                    />
                </div>
            </div>
        </DialogContent>
    );
}
