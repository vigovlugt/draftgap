import { useUser } from "../../contexts/UserContext";
import { DialogContent, DialogHeader, DialogTitle } from "../common/Dialog";
import { t } from "../../utils/i18n";

export function FAQDialog() {
    const { config } = useUser();

    return (
        <DialogContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{t(config, "faq")}</DialogTitle>
            </DialogHeader>
            <div>
                <h2 class="text-2xl uppercase">
                    {t(config, "faqWhatIsDraftGap")}
                </h2>
                <p class="font-body">{t(config, "faqWhatIsDraftGapBody")}</p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    {t(config, "faqHowDoesThisWork")}
                </h2>
                <p class="font-body">
                    {t(config, "faqHowDoesThisWorkBody")}{" "}
                    <a
                        href="https://www.youtube.com/@Jayensee"
                        class="text-blue-500"
                        target="_blank"
                    >
                        Jayensee
                    </a>
                    .
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    {t(config, "faqShortcomings")}
                </h2>
                <p class="font-body">{t(config, "faqShortcomingsBody")}</p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    {t(config, "faqDataSource")}
                </h2>
                <p class="font-body">
                    {t(config, "faqDataSourceBody")}{" "}
                    <a
                        href="https://lolalytics.com"
                        class="text-blue-500"
                        target="_blank"
                    >
                        Lolalytics
                    </a>
                    .
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    {t(config, "faqRankFilter")}
                </h2>
                <p class="font-body">{t(config, "faqRankFilterBody")}</p>
            </div>

            <div>
                <h2 class="text-2xl uppercase" id="faq-risk-level">
                    {t(config, "faqRiskLevel")}
                </h2>
                <p class="font-body">{t(config, "faqRiskLevelBody")}</p>
            </div>

            <p class="font-body font-bold">
                {t(config, "faqContact")}{" "}
                <a
                    href="mailto:vigovlugt+draftgap@gmail.com"
                    class="text-blue-500 font-normal"
                    target="_blank"
                >
                    vigovlugt+draftgap@gmail.com
                </a>
            </p>
        </DialogContent>
    );
}
