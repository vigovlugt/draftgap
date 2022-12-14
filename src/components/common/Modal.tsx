import {
    Transition,
    Dialog,
    TransitionChild,
    DialogPanel,
    DialogTitle,
    Button,
} from "solid-headless";
import { Icon } from "solid-heroicons";
import { Accessor, JSX, Setter } from "solid-js";
import { xMark } from "solid-heroicons/solid";

interface Props {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    children: JSX.Element;
    title: JSX.Element;
    titleContainerClass?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    className?: string;
}

export default function Modal({
    isOpen,
    setIsOpen,
    title,
    children,
    size = "md",
    titleContainerClass,
    className,
}: Props) {
    function close() {
        setIsOpen(false);
    }

    const maxWClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
    }[size];

    return (
        <>
            <Transition unmount appear show={isOpen()}>
                <Dialog isOpen class="relative z-10" onClose={close}>
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div class="fixed inset-0 bg-black bg-opacity-40" />
                    </TransitionChild>

                    <div
                        class="fixed inset-0 overflow-y-auto"
                        style={{
                            "scroll-behavior": "smooth",
                        }}
                    >
                        <div
                            class="flex min-h-full items-center justify-center p-4 text-center"
                            onClick={(e) => {
                                if (e.target !== e.currentTarget) return;

                                setIsOpen(false);
                            }}
                        >
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel
                                    class={`w-full transform overflow-hidden rounded-2xl bg-primary p-6 text-left align-middle shadow-xl transition-all ring-1 ring-white ring-opacity-10 ${maxWClass} ${className}`}
                                >
                                    <div
                                        class={`flex justify-between mb-4 ${titleContainerClass}`}
                                    >
                                        <DialogTitle
                                            as="h3"
                                            class="text-4xl uppercase font-medium leading-6"
                                        >
                                            {title}
                                        </DialogTitle>
                                        <Button onClick={close}>
                                            <Icon
                                                path={xMark}
                                                class="h-[24px] text-neutral-400"
                                            />
                                        </Button>
                                    </div>
                                    {children}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
