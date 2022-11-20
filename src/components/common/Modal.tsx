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
}

export default function Modal({ isOpen, setIsOpen, title, children }: Props) {
    function close() {
        setIsOpen(false);
    }

    return (
        <>
            <Transition appear show={isOpen()}>
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

                    <div class="fixed inset-0 overflow-y-auto">
                        <div class="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary p-6 text-left align-middle shadow-xl transition-all">
                                    <div class="flex justify-between mb-4">
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
