import { check, star } from "solid-heroicons/outline";
import toast from "solid-toast";
import { Toast } from "../components/common/Toast";

type ToastType = "import-favourite-picks" | "import-favourite-picks-success";

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

setTimeout(() => {
    createImportFavouritePicksToast(() => {});
}, 100);

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
