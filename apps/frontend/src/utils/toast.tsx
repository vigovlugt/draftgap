import { check, exclamationCircle, star } from "solid-heroicons/outline";
import toast from "solid-toast";
import { Toast } from "../components/common/Toast";
import { DraftGapConfig } from "@draftgap/core/src/models/user/Config";
import { t } from "./i18n";

export const createImportFavouritePicksToast = (
    config: DraftGapConfig,
    onSubmit: () => void,
) => {
    return toast.custom((toastModel) => (
        <Toast
            t={toastModel}
            icon={star}
            title={t(config, "importFavouriteChampions")}
            content={t(config, "importFavouriteChampionsQuestion")}
            dismissText={t(config, "notNow")}
            okText={t(config, "import")}
            onSubmit={onSubmit}
        />
    ));
};

export const createImportFavouritePicksSuccessToast = (
    config: DraftGapConfig,
    amount: number,
) => {
    return toast.custom(
        (toastModel) => (
            <Toast
                t={toastModel}
                icon={check}
                title={t(config, "success")}
                content={t(config, "importedFavouriteChampions", { amount })}
            />
        ),
        {
            duration: 3000,
        },
    );
};

export const createErrorToast = (config: DraftGapConfig, message: string) => {
    return toast.custom(
        (toastModel) => (
            <Toast
                t={toastModel}
                icon={exclamationCircle}
                title={t(config, "error")}
                content={message}
            />
        ),
        {
            duration: 3000,
        },
    );
};

export const createMustSelectToast = (config: DraftGapConfig) => {
    return toast.custom(
        (toastModel) => (
            <Toast
                t={toastModel}
                icon={exclamationCircle}
                title={t(config, "noPickSelected")}
                content={t(config, "noPickSelectedHelp")}
            />
        ),
        {
            duration: 3000,
        },
    );
};
