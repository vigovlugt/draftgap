import { Show } from "solid-js";
import {
    arrowTopRightOnSquare,
    noSymbol,
    presentationChartLine,
    star,
    userPlus,
} from "solid-heroicons/solid-mini";
import { Role } from "@draftgap/core/src/models/Role";
import { Team } from "@draftgap/core/src/models/Team";
import { useDraft } from "../../contexts/DraftContext";
import { useDataset } from "../../contexts/DatasetContext";
import { useUser } from "../../contexts/UserContext";
import { championName } from "../../utils/i18n";
import { linkByStatsSite } from "../../utils/sites";
import { ContextMenuContent } from "../common/ContextMenu";
import {
    DropdownMenuGroup,
    DropdownMenuIcon,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "../common/DropdownMenu";

type Props = {
    championKey: string;
    role: Role;
    onAnalysis?: () => void;
};

export function ChampionContextMenuContent(props: Props) {
    const { dataset } = useDataset();
    const { config, isFavourite, setFavourite } = useUser();
    const {
        pickChampion,
        addBan,
        getNextPick,
        getNextBan,
        allyTeam,
        opponentTeam,
        bans,
    } = useDraft();

    const champion = () => dataset()?.championData[props.championKey];

    const isPicked = () =>
        [...allyTeam, ...opponentTeam].some(
            (p) => p.championKey === props.championKey,
        );
    const isBanned = () =>
        [...bans.ally, ...bans.opponent].includes(props.championKey);

    const canPick = (team: Team) => getNextPick(team) !== -1;
    const canBan = (team: Team) => getNextBan(team) !== -1;

    const pickFor = (team: Team) =>
        pickChampion(team, getNextPick(team), props.championKey, props.role);

    const favourite = () => isFavourite(props.championKey, props.role);

    return (
        <ContextMenuContent>
            <Show when={champion()}>
                <DropdownMenuLabel>
                    {championName(champion()!, config)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={!canPick("ally") || isPicked()}
                        onSelect={() => pickFor("ally")}
                    >
                        <DropdownMenuIcon path={userPlus} />
                        <span>Pick for ally</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={!canPick("opponent") || isPicked()}
                        onSelect={() => pickFor("opponent")}
                    >
                        <DropdownMenuIcon path={userPlus} />
                        <span>Pick for opponent</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={!canBan("ally") || isBanned()}
                        onSelect={() => addBan("ally", props.championKey)}
                    >
                        <DropdownMenuIcon path={noSymbol} />
                        <span>Ban for ally</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={!canBan("opponent") || isBanned()}
                        onSelect={() => addBan("opponent", props.championKey)}
                    >
                        <DropdownMenuIcon path={noSymbol} />
                        <span>Ban for opponent</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() =>
                            setFavourite(
                                props.championKey,
                                props.role,
                                !favourite(),
                            )
                        }
                    >
                        <DropdownMenuIcon path={star} />
                        <span>
                            {favourite() ? "Unfavourite" : "Favourite"}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a
                            target="_blank"
                            class="flex items-center w-full"
                            href={linkByStatsSite(
                                config.defaultStatsSite,
                                champion()!.id,
                                props.role,
                            )}
                        >
                            <DropdownMenuIcon path={arrowTopRightOnSquare} />
                            <span>{config.defaultStatsSite}</span>
                        </a>
                    </DropdownMenuItem>
                    <Show when={props.onAnalysis}>
                        <DropdownMenuItem onSelect={() => props.onAnalysis!()}>
                            <DropdownMenuIcon path={presentationChartLine} />
                            <span>Preview</span>
                        </DropdownMenuItem>
                    </Show>
                </DropdownMenuGroup>
            </Show>
        </ContextMenuContent>
    );
}
