import { Show } from "solid-js";
import { Team } from "../../lib/models/Team";
import { useDraftAnalysis } from "../../context/DraftAnalysisContext";

export function DamageDistributionBar(props: { team: Team }) {
    const { allyDamageDistribution, opponentDamageDistribution } =
        useDraftAnalysis();

    const damageDistribution = () =>
        props.team === "ally"
            ? allyDamageDistribution()
            : opponentDamageDistribution();

    const totalDamage = () =>
        damageDistribution()!.magic +
        damageDistribution()!.physical +
        damageDistribution()!.true;

    const magicPercentage = () => damageDistribution()!.magic / totalDamage();
    const physicalPercentage = () =>
        damageDistribution()!.physical / totalDamage();
    const truePercentage = () => damageDistribution()!.true / totalDamage();

    return (
        <Show
            when={
                damageDistribution() &&
                damageDistribution()!.magic +
                    damageDistribution()!.physical +
                    damageDistribution()!.true >
                    0
            }
        >
            <div class="flex h-1 absolute right-0 left-0 top-0 w-full">
                <div
                    class="bg-red-500 transition-all duration-500"
                    style={{ width: physicalPercentage() * 100 + "%" }}
                />
                <div
                    class="bg-blue-500 transition-all duration-500"
                    style={{ width: magicPercentage() * 100 + "%" }}
                />
                <div
                    class="bg-neutral-100 transition-all duration-500"
                    style={{ width: truePercentage() * 100 + "%" }}
                />
            </div>
        </Show>
    );
}
