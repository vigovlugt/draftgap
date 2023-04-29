import { Icon } from "solid-heroicons";
import { questionMarkCircle } from "solid-heroicons/solid-mini";
import { Accessor, Setter, Show } from "solid-js";
import {
    DraftTablePlacement,
    StatsSite,
    useDraft,
} from "../../context/DraftContext";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import Modal from "../common/Modal";
import { Toggle } from "../common/Toggle";
import { RiskLevel, displayNameByRiskLevel } from "../../lib/risk/risk-level";

interface Props {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    setFAQOpen: Setter<boolean>;
}

export default function SettingsModal({
    isOpen,
    setIsOpen,
    setFAQOpen,
}: Props) {
    const { config, setConfig, isDesktop } = useDraft();

    const riskLevelOptions: ButtonGroupOption<RiskLevel>[] = RiskLevel.map(
        (level) => ({
            value: level,
            label: displayNameByRiskLevel[level],
        })
    );

    const draftTablePlacementOptions = [
        {
            value: DraftTablePlacement.Bottom,
            label: "Bottom",
        },
        {
            value: DraftTablePlacement.InPlace,
            label: "In Place",
        },
        {
            value: DraftTablePlacement.Hidden,
            label: "Hidden",
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
        <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Settings">
            <h3 class="text-3xl uppercase">Draft</h3>
            <div class="flex space-x-16 items-center justify-between mt-2">
                <span class="text-lg uppercase">
                    Ignore indivdual champion winrates
                </span>
                <Toggle
                    isChecked={() => config().ignoreChampionWinrates}
                    onChange={() =>
                        setConfig({
                            ...config(),
                            ignoreChampionWinrates:
                                !config().ignoreChampionWinrates,
                        })
                    }
                />
            </div>
            <div class="flex items-center mt-1 mb-1 gap-1">
                <span class="text-lg uppercase block">Risk level</span>
                <button
                    onClick={() => {
                        setFAQOpen(true);
                        setTimeout(() => {
                            document
                                .getElementById("faq-risk-level")!
                                .scrollIntoView({
                                    behavior: "smooth",
                                });
                        }, 300);
                    }}
                >
                    <Icon
                        path={questionMarkCircle}
                        class="w-5 inline text-neutral-400 -mt-1"
                    />
                </button>
            </div>
            <ButtonGroup
                options={riskLevelOptions}
                selected={() => config().riskLevel}
                size="sm"
                onChange={(value: RiskLevel) => {
                    setConfig({
                        ...config(),
                        riskLevel: value,
                    });
                }}
            />
            <h3 class="text-3xl uppercase mt-4">UI</h3>
            <div class="flex space-x-8 items-center justify-between mt-2">
                <span class="text-lg uppercase">
                    Place favourites at top of suggestions
                </span>
                <Toggle
                    isChecked={() => config().showFavouritesAtTop}
                    onChange={() =>
                        setConfig({
                            ...config(),
                            showFavouritesAtTop: !config().showFavouritesAtTop,
                        })
                    }
                />
            </div>

            <Show when={isDesktop}>
                <div class="flex flex-col gap-1 mt-2">
                    <span class="text-lg uppercase">
                        Place banned champion suggestions at
                    </span>
                    <ButtonGroup
                        options={draftTablePlacementOptions}
                        selected={() => config().banPlacement}
                        size="sm"
                        onChange={(v) =>
                            setConfig({
                                ...config(),
                                banPlacement: v,
                            })
                        }
                    />
                </div>
                <div class="flex flex-col gap-1 mt-2">
                    <span class="text-lg uppercase">
                        Place unowned champion suggestions at
                    </span>
                    <ButtonGroup
                        options={[
                            {
                                value: DraftTablePlacement.Bottom,
                                label: "Bottom",
                            },
                            {
                                value: DraftTablePlacement.InPlace,
                                label: "In Place",
                            },
                            {
                                value: DraftTablePlacement.Hidden,
                                label: "Hidden",
                            },
                        ]}
                        size="sm"
                        selected={() => config().unownedPlacement}
                        onChange={(v) =>
                            setConfig({
                                ...config(),
                                unownedPlacement: v,
                            })
                        }
                    />
                </div>
            </Show>

            <Show when={isDesktop}>
                <h3 class="text-3xl uppercase mt-4">League Client</h3>
                <div class="flex space-x-16 items-center justify-between mt-2">
                    <span class="text-lg uppercase">
                        Disable league client integration
                    </span>
                    <Toggle
                        isChecked={() =>
                            config().disableLeagueClientIntegration
                        }
                        onChange={() =>
                            setConfig({
                                ...config(),
                                disableLeagueClientIntegration:
                                    !config().disableLeagueClientIntegration,
                            })
                        }
                    />
                </div>
            </Show>

            <h3 class="text-3xl uppercase mt-4">Misc</h3>
            <div class="flex flex-col gap-1 mt-2">
                <span class="text-lg uppercase">Favourite builds site</span>
                <ButtonGroup
                    options={statsSiteOptions}
                    selected={() => config().defaultStatsSite}
                    size="sm"
                    onChange={(value: StatsSite) => {
                        setConfig({
                            ...config(),
                            defaultStatsSite: value,
                        });
                    }}
                />
            </div>
        </Modal>
    );
}
