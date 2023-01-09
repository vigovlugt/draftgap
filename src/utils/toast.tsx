import { check, exclamationCircle, star, xMark } from "solid-heroicons/outline";
import toast from "solid-toast";
import { Toast } from "../components/common/Toast";

export const createImportFavouritePicksToast = (onSubmit: () => void) => {
    return toast.custom((t) => (
        <Toast
            t={t}
            icon={star}
            title="Import favourite champions"
            content="Do you want to import your favourite champions from the League client?"
            dismissText="Not now"
            okText="Import"
            onSubmit={onSubmit}
        />
    ));
};

export const createImportFavouritePicksSuccessToast = (amount: number) => {
    return toast.custom(
        (t) => (
            <Toast
                t={t}
                icon={check}
                title="Success"
                content={`Successfully imported ${amount} favourite champions.`}
            />
        ),
        {
            duration: 3000,
        }
    );
};

export const createErrorToast = (message: string) => {
    return toast.custom(
        (t) => (
            <Toast
                t={t}
                icon={exclamationCircle}
                title="Error"
                content={message}
            />
        ),
        {
            duration: 3000,
        }
    );
};

export const createMustSelectToast = () => {
    return toast.custom(
        (t) => (
            <Toast
                t={t}
                icon={exclamationCircle}
                title="No pick selected"
                content="Select a pick first by clicking on one in the draft or opponent tab."
            />
        ),
        {
            duration: 3000,
        }
    );
};
