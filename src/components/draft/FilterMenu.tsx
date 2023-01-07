import { Icon } from "solid-heroicons";
import { funnel } from "solid-heroicons/solid";
import { Component, JSX } from "solid-js";
import { useDraft } from "../../context/DraftContext";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import { Popover } from "../common/Popover";

type Props = {} & JSX.HTMLAttributes<HTMLDivElement>;

export const FilterMenu: Component<Props> = (props) => {
    const { config, setConfig } = useDraft();

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
                        Minumum game count
                    </span>
                    <ButtonGroup
                        options={minGameCountOptions}
                        selected={() => config().minGames}
                        onChange={(value: number) => {
                            setConfig({
                                ...config(),
                                minGames: value,
                            });
                        }}
                    />
                </div>
            )}
        </Popover>
    );
};
