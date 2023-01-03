import { Component, JSX, Show } from "solid-js";
import {
    Menu,
    MenuItem,
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
    children: JSX.Element;
    items: PopoverItem[];
    buttonClass: string;
};

export const Popover: Component<Props> = (props: Props) => {
    return (
        <PopoverComponent defaultOpen={false} class="relative">
            {({ isOpen, setState }) => (
                <>
                    <PopoverButton
                        classList={{
                            "text-opacity-90": isOpen(),
                        }}
                        class={`bg-transparent p-2 px-1 rounded-md hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${props.buttonClass}`}
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                    >
                        {props.children}
                    </PopoverButton>
                    <Show when={isOpen()}>
                        <PopoverPanel
                            unmount={false}
                            class="absolute px-4 transform right-0 sm:px-0 lg:max-w-3xl z-20"
                        >
                            <Menu class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-neutral-800 flex flex-col cursor-default z-100">
                                {props.items.map((item) => (
                                    <MenuItem
                                        as={
                                            (item as LinkItem).href
                                                ? "a"
                                                : "button"
                                        }
                                        // @ts-ignore
                                        href={(item as LinkItem).href}
                                        target="_blank"
                                        class="text-2xl uppercase p-2 text-left focus:outline-none flex items-center space-x-2 transition-colors duration-150 ease-in-out tracking-wider"
                                        classList={{
                                            "hover:bg-neutral-700":
                                                !item.disabled,
                                            "opacity-50 cursor-default":
                                                item.disabled,
                                        }}
                                        onClick={(e: MouseEvent) => {
                                            if (item.disabled) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }

                                            (item as ButtonItem).onClick?.();
                                            setState(false);
                                        }}
                                    >
                                        {item.icon ? (
                                            <Icon
                                                path={item.icon}
                                                class="w-5 mx-1 text-neutral-400"
                                            />
                                        ) : (
                                            <div class="w-5 mx-1" />
                                        )}
                                        <span>{item.content}</span>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </PopoverPanel>
                    </Show>
                </>
            )}
        </PopoverComponent>
    );
};
