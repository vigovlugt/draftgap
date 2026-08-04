import { Icon } from "solid-heroicons";
import { language } from "solid-heroicons/solid";
import { Component } from "solid-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./common/DropdownMenu";
import { cn } from "../utils/style";
import { buttonVariants } from "./common/Button";
import { useUser } from "../contexts/UserContext";
import { t } from "../utils/i18n";

export const LanguageDropdownMenu: Component = () => {
    const { config, setConfig } = useUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <button
                    class={cn(
                        buttonVariants({ variant: "transparent" }),
                        "px-1 py-2",
                    )}
                >
                    <Icon path={language} class="w-7" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>{t(config, "language")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() => setConfig({ language: "en_US" })}
                        class={cn(
                            config.language === "en_US" && "bg-neutral-700",
                        )}
                    >
                        <span>{t(config, "english")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setConfig({ language: "zh_CN" })}
                        class={cn(
                            config.language === "zh_CN" && "bg-neutral-700",
                        )}
                    >
                        <span>{t(config, "simplifiedChinese")}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel class="text-neutral-500 text-sm">
                    {t(config, "uiLanguageHint")}
                </DropdownMenuLabel>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
