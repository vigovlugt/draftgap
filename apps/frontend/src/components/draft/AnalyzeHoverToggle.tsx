import { useDraftAnalysis } from "../../contexts/DraftAnalysisContext";
import { tooltip } from "../../directives/tooltip";
import { Icon } from "solid-heroicons";
import { eye, eyeSlash } from "solid-heroicons/solid";
import { cn } from "../../utils/style";
import { buttonVariants } from "../common/Button";
// eslint-disable-next-line 
tooltip;

export function AnalyzeHoverToggle() {
    const { analyzeHovers, setAnalyzeHovers } = useDraftAnalysis();

    return (
        <button
            // @ts-ignore
            use:tooltip={{
                content: "Analyze hovered champions in the draft",
            }}
            onClick={() => setAnalyzeHovers((v) => !v)}
            class={cn(
                buttonVariants({ variant: "transparent" }),
                "px-1 text-neutral-50",
                !analyzeHovers() && "text-neutral-700"
            )}
        >
            <Icon path={analyzeHovers() ? eye : eyeSlash} class="w-6 h-6" />
        </button>
    );
}
