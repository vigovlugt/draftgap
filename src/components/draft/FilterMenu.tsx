import { Icon } from "solid-heroicons";
import { funnel } from "solid-heroicons/solid";
import { Component, JSX } from "solid-js";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import { Popover } from "../common/Popover";
import { useConfig } from "../../context/ConfigContext";

type Props = JSX.HTMLAttributes<HTMLDivElement>;

export const FilterMenu: Component<Props> = (props) => {
    const { config, setConfig } = useConfig();

    const minGameCountOptions: ButtonGroupOption<number>[] = [
        500, 1000, 2500, 5000,
    ].map((n) => ({
        value: n,
        label: n.toString(),
    }));

    return (
        <Popover
            buttonChildren={<Icon path={funnel} class="w-6 text-neutral-300" />}
            buttonClass="mr-4"
            {...props}
        >
            {() => (
                <div class="py-2 px-4">
                    <span class="text-2xl uppercase block mb-1">Filters</span>
                    <span class="text-lg uppercase block">
                        Minimum game count (7d)
                    </span>
                    <ButtonGroup
                        options={minGameCountOptions}
                        selected={config.minGames}
                        onChange={(value: number) =>
                            setConfig({
                                minGames: value,
                            })
                        }
                    />
                </div>
            )}
        </Popover>
    );
};
