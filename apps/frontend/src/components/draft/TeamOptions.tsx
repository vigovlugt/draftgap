import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "@draftgap/core/src/models/Team";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuIcon,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../common/DropdownMenu";
import { cn } from "../../utils/style";
import { buttonVariants } from "../common/Button";
import { useUser } from "../../contexts/UserContext";
import { t, teamName } from "../../utils/i18n";

type Props = {
    team: Team;
};
export function TeamOptions(props: Props) {
    const { resetTeam } = useDraft();
    const { config } = useUser();

    return (
        <div class="absolute right-1 top-0">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <button
                        class={cn(
                            buttonVariants({ variant: "transparent" }),
                            "px-1 py-2",
                        )}
                    >
                        <Icon path={ellipsisVertical} class="h-7" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        {t(config, "teamLabel", {
                            team: teamName(config, props.team),
                        })}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => resetTeam(props.team)}
                        >
                            <DropdownMenuIcon path={trash} />
                            <span>{t(config, "resetTeam")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
