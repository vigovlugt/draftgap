import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/solid";
import {
    cog_6Tooth,
    envelope,
    globeAlt,
    heart,
    questionMarkCircle,
} from "solid-heroicons/solid-mini";
import { Component } from "solid-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuIcon,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./common/DropdownMenu";
import { cn } from "../utils/style";
import { buttonVariants } from "./common/Button";

type Props = {
    setShowSettings: (show: boolean) => void;
    setShowFAQ: (show: boolean) => void;
};

export const OptionsDropdownMenu: Component<Props> = (props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <button
                    class={cn(
                        buttonVariants({ variant: "transparent" }),
                        "px-1 py-2"
                    )}
                >
                    <Icon path={ellipsisVertical} class="w-7" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>Draftgap</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() => props.setShowSettings(true)}
                    >
                        <DropdownMenuIcon path={cog_6Tooth} />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => props.setShowFAQ(true)}>
                        <DropdownMenuIcon path={questionMarkCircle} />
                        <span>FAQ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href="mailto:vigovlugt+draftgap@gmail.com" target="_blank" class="flex items-center">
                            <DropdownMenuIcon path={envelope} />
                            <span>Contact</span>
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href="https://leagueofitems.com" target="_blank" class="flex items-center">
                            <DropdownMenuIcon path={globeAlt} />
                            <span>LeagueOfItems</span>
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href="https://www.buymeacoffee.com/vigovlugt" target="_blank" class="flex items-center">
                            <DropdownMenuIcon path={heart} />
                            <span>Donate</span>
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
