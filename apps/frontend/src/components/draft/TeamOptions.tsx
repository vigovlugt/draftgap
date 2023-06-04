import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { trash } from "solid-heroicons/solid-mini";
import { useDraft } from "../../contexts/DraftContext";
import { Team } from "draftgap-core/src/models/Team";
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
import { As } from "@kobalte/core";
import { cn } from "../../utils/style";
import { buttonVariants } from "../common/Button";

type Props = {
    team: Team;
};
export function TeamOptions(props: Props) {
    const { resetTeam } = useDraft();

    return (
        <div class="absolute right-1 top-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <As
                        component="button"
                        class={cn(
                            buttonVariants({ variant: "transparent" }),
                            "px-1 py-2"
                        )}
                    />
                    <Icon path={ellipsisVertical} class="h-7" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>{props.team} team</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => resetTeam(props.team)}
                        >
                            <DropdownMenuIcon path={trash} />
                            <span>Reset team</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
