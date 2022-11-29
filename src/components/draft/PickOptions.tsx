import {
    Menu,
    MenuItem,
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition,
} from "solid-headless";
import { Icon } from "solid-heroicons";
import { ellipsisVertical } from "solid-heroicons/outline";
import { arrowTopRightOnSquare, trash, user } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";

export function PickOptions({ team, index }: { team: Team; index: number }) {
    const { pickChampion, allyTeam, opponentTeam, dataset } = useDraft();

    const teamPicks = () => (team === "ally" ? allyTeam : opponentTeam);

    const champion = () =>
        teamPicks()[index].championKey
            ? dataset()?.championData[teamPicks()[index].championKey!]
            : undefined;

    return (
        <div class="absolute right-0 top-0">
            <Popover defaultOpen={false} class="relative">
                {({ isOpen, setState }) => (
                    <>
                        <PopoverButton
                            classList={{
                                "text-opacity-90": isOpen(),
                            }}
                            class="bg-transpartent p-2 px-1 rounded-md hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                        >
                            <Icon path={ellipsisVertical} class="h-7"></Icon>
                        </PopoverButton>
                        <Transition
                            show={isOpen()}
                            class="transitiont duration-150"
                            enterFrom="opacity-0 -translate-y-1 scale-50"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 -translate-y-1 scale-50"
                        >
                            <PopoverPanel
                                unmount={false}
                                class="absolute z-10 px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl"
                            >
                                <Menu class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-neutral-800 flex flex-col space-y-1 py-1">
                                    <MenuItem
                                        as="button"
                                        class="text-2xl uppercase p-1 px-2 pr-3 text-left hover:bg-neutral-700 focus:outline-none flex items-center space-x-2"
                                        onClick={() => {
                                            pickChampion(
                                                team,
                                                index,
                                                undefined,
                                                undefined
                                            );
                                            setState(false);
                                        }}
                                    >
                                        <Icon
                                            path={trash}
                                            class="w-[20px] mx-1"
                                        />
                                        <span>RESET</span>
                                    </MenuItem>
                                    <MenuItem
                                        as="a"
                                        disabled={!champion()}
                                        href={
                                            champion()
                                                ? `https://lolalytics.com/lol/${champion()!.id.toLowerCase()}/build/`
                                                : undefined
                                        }
                                        onClick={() => setState(false)}
                                        target="_blank"
                                        class="text-2xl uppercase p-1 px-2 pr-3 text-left focus:outline-none flex items-center space-x-2"
                                        classList={{
                                            "opacity-50 cursor-default":
                                                !champion(),
                                            "hover:bg-neutral-700":
                                                !!champion(),
                                        }}
                                    >
                                        <Icon
                                            path={user}
                                            class="w-[20px] mx-1"
                                        />
                                        <span>
                                            {champion()?.name} Lolalytics
                                        </span>
                                    </MenuItem>
                                </Menu>
                            </PopoverPanel>
                        </Transition>
                    </>
                )}
            </Popover>
        </div>
    );
}
