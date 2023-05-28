import { Component, For, JSX } from "solid-js";
import { MenuItem } from "solid-headless";
import { Icon } from "solid-heroicons";
import { Popover } from "./Popover";
import { chevronRight } from "solid-heroicons/solid-mini";

type Icon = {
    path: JSX.Element;
    outline?: boolean | undefined;
    mini?: boolean | undefined;
};

type BaseItem = {
    icon?: Icon;
    content: JSX.Element;
    disabled?: boolean | undefined;
    key?: string;
    items?: PopoverItem[];
};
type LinkItem = BaseItem & {
    href: string;
};

type ButtonItem = BaseItem & {
    onClick?: () => void;
};

export type PopoverItem = LinkItem | ButtonItem;

type Props = {
    children: JSX.Element;
    items: PopoverItem[];
    buttonClass?: string;
};

export const DropdownMenu: Component<Props> = (props: Props) => {
    return (
        <Popover buttonChildren={props.children}>
            {({ setState }) => (
                <For each={props.items}>
                    {(item) => (
                        <MenuItem
                            as={(item as LinkItem).href ? "a" : "button"}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            href={(item as LinkItem).href}
                            target="_blank"
                            class="text-lg uppercase p-2 py-1.5 text-left focus:outline-none flex items-center space-x-2 transition-colors duration-150 ease-in-out"
                            classList={{
                                "hover:bg-neutral-700": !item.disabled,
                                "opacity-50 cursor-default": item.disabled,
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
                            <div class="!ml-auto text-base text-neutral-400">
                                {item.items ? (
                                    <Icon
                                        path={chevronRight}
                                        class="w-5 h-5 pr-[0.1rem]"
                                    />
                                ) : (
                                    <span class="pr-2">{item.key}</span>
                                )}
                            </div>
                        </MenuItem>
                    )}
                </For>
            )}
        </Popover>
    );
};
