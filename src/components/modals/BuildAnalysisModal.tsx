import { Component } from "solid-js";
import Modal from "../common/Modal";

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

export const BuildAnalysisModal: Component<Props> = (props) => {
    return (
        <Modal
            isOpen={props.isOpen}
            setIsOpen={props.setIsOpen}
            title=""
            titleContainerClass="!h-0 !m-0"
            size="3xl"
            className="max-w-[calc(100vw_-_1rem)]"
        >
            test
        </Modal>
    );
};
