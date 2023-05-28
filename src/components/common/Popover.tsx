import { Component, JSX, createSignal } from "solid-js";
import {
    Menu,
    Popover as PopoverComponent,
    PopoverButton,
    PopoverPanel,
    Transition,
    HeadlessDisclosureProperties,
} from "solid-headless";
import { Icon } from "solid-heroicons";
import usePopper from "solid-popper";

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
    const [anchor, setAnchor] = createSignal<HTMLElement | null>(null);
    const [popper, setPopper] = createSignal<HTMLElement | null>(null);

    usePopper(anchor, popper, {
        placement: "bottom-end",
    });

    return (
        <PopoverComponent defaultOpen={false} class="relative">
            {(properties) => (
                <>
                    <PopoverButton
                        classList={{
                            "text-opacity-90": properties.isOpen(),
                        }}
                        class={`transition duration-100 bg-white bg-opacity-0 p-2 px-1 rounded-md hover:text-opacity-100 hover:bg-opacity-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${props.buttonClass}`}
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        ref={setAnchor}
                    >
                        {props.buttonChildren}
                    </PopoverButton>
                    <Transition
                        show={properties.isOpen()}
                        style={{
                            position: "relative",
                        }}
                        class="isolate z-[2] opacity-0"
                        enter="transition duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <PopoverPanel
                            unmount={false}
                            class="px-4 sm:px-0 lg:max-w-3xl absolute z-10 transform -translate-x-1/2 left-1/2"
                            ref={setPopper}
                        >
                            <Menu
                                as="div"
                                class="relative overflow-hidden w-64 rounded-lg bg-neutral-800 flex flex-col cursor-default ring-1 ring-white ring-opacity-10"
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
