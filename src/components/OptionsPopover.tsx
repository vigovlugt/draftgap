import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/solid";
import {
    cog_6Tooth,
    envelope,
    globeAlt,
    questionMarkCircle,
} from "solid-heroicons/solid-mini";
import { Component, createSignal } from "solid-js";
import { Popover, PopoverItem } from "./common/Popover";

type Props = {
    setShowSettings: (show: boolean) => void;
    setShowFAQ: (show: boolean) => void;
};

export const OptionsPopover: Component<Props> = ({
    setShowSettings,
    setShowFAQ,
}) => {
    const items: PopoverItem[] = [
        {
            content: "Settings",
            icon: cog_6Tooth,
            onClick() {
                setShowSettings(true);
            },
        },
        {
            content: "FAQ",
            icon: questionMarkCircle,
            onClick() {
                setShowFAQ(true);
            },
        },
        {
            content: "Contact",
            icon: envelope,
            href: "mailto:vigovlugt+draftgap@gmail.com",
        },
        {
            content: "LeagueOfItems",
            icon: globeAlt,
            href: "https://leagueofitems.com",
        },
    ];
    return (
        <Popover items={items} buttonClass="px-0">
            <Icon path={ellipsisVertical} class="w-7" />
        </Popover>
    );
};
