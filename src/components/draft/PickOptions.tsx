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
import { trash } from "solid-heroicons/solid-mini";
import { useDraft } from "../../context/DraftContext";
import { Team } from "../../lib/models/Team";

export function PickOptions({ team, index }: { team: Team; index: number }) {
    const { pickChampion } = useDraft();

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
                                <Menu class="overflow-hidden w-64 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 bg-neutral-800 flex flex-col space-y-1 p-2">
                                    <MenuItem
                                        as="button"
                                        class="text-2xl uppercase p-1 px-2 text-left rounded-lg hover:bg-neutral-700 focus:outline-none flex items-center space-x-2"
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
                                        <Icon path={trash} class="w-[20px]" />
                                        <span>RESET</span>
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
