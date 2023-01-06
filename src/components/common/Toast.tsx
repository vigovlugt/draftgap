import { Icon } from "solid-heroicons";
import { Component, JSX, Show } from "solid-js";
import toast, { Toast as ToastModel } from "solid-toast";

type Props = {
    t: ToastModel;
    title: string;
    content: string;
    icon: {
        path: JSX.Element;
        outline?: boolean;
        mini?: boolean;
    };
    dismissText?: string;
    okText?: string;
    onSubmit?: () => void;
};

export const Toast: Component<Props> = (props) => {
    return (
        <div
            class={`${
                props.t.visible ? "animate-enter" : "animate-leave"
            } relative max-w-sm w-full bg-neutral-800 rounded-lg overflow-hidden`}
        >
            <div class="p-2">
                <div class="flex items-start">
                    <div class="flex-shrink-0 pt-[4px]">
                        <Icon path={props.icon} class="w-6 text-neutral-400" />
                    </div>
                    <div class="ml-2 w-0 flex-1 pt-0.5">
                        <p class="text-xl font-medium text-gray-50 uppercase">
                            {props.title}
                        </p>
                        <p class="mt-1 text-gray-300 font-body">
                            {props.content}
                        </p>
                        <Show when={props.dismissText && props.okText}>
                            <div class="mt-1 flex justify-between">
                                <button
                                    type="button"
                                    class="uppercase text-lg font-medium text-neutral-400 hover:text-neutral-300 transition ease-out duration-150"
                                    onClick={() => toast.dismiss(props.t.id)}
                                >
                                    {props.dismissText}
                                </button>
                                <button
                                    type="button"
                                    class="uppercase text-lg font-medium hover:text-neutral-300 transition ease-out duration-150"
                                    onClick={() => {
                                        toast.dismiss(props.t.id);
                                        props.onSubmit?.();
                                    }}
                                >
                                    {props.okText}
                                </button>
                            </div>
                        </Show>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button
                            class="rounded-md inline-flex text-gray-400 hover:text-gray-500 transition ease-out duration-150"
                            onClick={() => toast.dismiss(props.t.id)}
                        >
                            <span class="sr-only">Close</span>
                            <svg
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
