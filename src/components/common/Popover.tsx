import { Component, JSX, Show } from "solid-js";
import {
    HeadlessDisclosureProperties,
    Menu,
    Popover as PopoverComponent,
    PopoverButton,
    PopoverPanel,
    Transition,
} from "solid-headless";
import { Icon } from "solid-heroicons";

type Icon = {
    path: JSX.Element;
    outline?: boolean | undefined;
    mini?: boolean | undefined;
};

type BaseItem = {
    icon?: Icon;
    content: JSX.Element;
    disabled?: boolean | undefined;
};
type LinkItem = BaseItem & {
    href: string;
};

type ButtonItem = BaseItem & {
    onClick: () => void;
};

export type PopoverItem = LinkItem | ButtonItem;

type Props = {
    children: (params: HeadlessDisclosureProperties) => JSX.Element;
    buttonChildren: JSX.Element;
    buttonClass?: string;
};

export const Popover: Component<Props> = (props: Props) => {
    return (
        <PopoverComponent defaultOpen={false} class="relative">
            {(properties) => (
                <>
                    <PopoverButton
                        classList={{
                            "text-opacity-90": properties.isOpen(),
                        }}
                        class={`bg-transparent p-2 px-1 rounded-md hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${props.buttonClass}`}
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                    >
                        {props.buttonChildren}
                    </PopoverButton>
                    <Transition
                        show={properties.isOpen()}
                        class="transition opacity-0 scale-95 isolate z-[2]"
                        style={{
                            // Classes on Transtion are removed or something
                            position: "relative",
                        }}
                        enter="transition duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <PopoverPanel
                            unmount={false}
                            class="absolute px-4 right-0 sm:px-0 lg:max-w-3xl"
                        >
                            <Menu
                                as="div"
                                class="relative overflow-hidden w-64 rounded-lg bg-neutral-800 flex flex-col cursor-default ring-1 ring-white ring-opacity-20"
                            >
                                {props.children(properties)}
                            </Menu>
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </PopoverComponent>
    );
};
