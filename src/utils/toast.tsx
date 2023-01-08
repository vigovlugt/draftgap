import { check, star, xMark } from "solid-heroicons/outline";
import toast from "solid-toast";
import { Toast } from "../components/common/Toast";

type ToastType =
    | "import-favourite-picks"
    | "import-favourite-picks-success"
    | "error";

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
        (t) => <Toast t={t} icon={xMark} title="Error" content={message} />,
        {
            duration: 3000,
        }
    );
};
