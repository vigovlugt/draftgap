import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { tooltip } from "../../directives/tooltip";
import { Icon } from "solid-heroicons";
import { eye, eyeSlash } from "solid-heroicons/solid";
import { cn } from "../../utils/style";
import { buttonVariants } from "../common/Button";
import { useUser } from "../../contexts/UserContext";
import { t } from "../../utils/i18n";
// eslint-disable-next-line
tooltip;

export function AnalyzeHoverToggle() {
    const { analyzeHovers, setAnalyzeHovers } = useDraftAnalysis();
    const { config } = useUser();

    return (
        <button
            // @ts-ignore
            use:tooltip={{
                content: t(config, "analyzeHoveredChampions"),
            }}
            onClick={() => setAnalyzeHovers((v) => !v)}
            class={cn(
                buttonVariants({ variant: "transparent" }),
                "px-1 text-neutral-50",
                !analyzeHovers() && "text-neutral-700",
            )}
        >
            <Icon path={analyzeHovers() ? eye : eyeSlash} class="w-6 h-6" />
        </button>
    );
}
