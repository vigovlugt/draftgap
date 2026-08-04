import { Icon } from "solid-heroicons";
import { funnel } from "solid-heroicons/solid";
import { ButtonGroup, ButtonGroupOption } from "../common/ButtonGroup";
import { Popover, PopoverContent, PopoverTrigger } from "../common/Popover";
import { useUser } from "../../contexts/UserContext";
import { buttonVariants } from "../common/Button";
import { cn } from "../../utils/style";
import { t } from "../../utils/i18n";

export function FilterMenu() {
    const { config, setConfig } = useUser();

    const minGameCountOptions: ButtonGroupOption<number>[] = [
        500, 1000, 2500, 5000,
    ].map((n) => ({
        value: n,
        label: n.toString(),
    }));

    return (
        <Popover>
            <PopoverTrigger
                class={cn(buttonVariants({ variant: "transparent" }), "px-1")}
            >
                <Icon path={funnel} class="w-6 text-neutral-300" />
            </PopoverTrigger>
            <PopoverContent>
                <span class="text-2xl uppercase block mb-1 leading-none">
                    {t(config, "filters")}
                </span>
                <span class="text-lg uppercase block">
                    {t(config, "minimumGameCount7d")}
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
            </PopoverContent>
        </Popover>
    );
}
