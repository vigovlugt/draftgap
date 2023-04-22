import {
    Component,
    Match,
    Show,
    Switch,
    createEffect,
    createSignal,
} from "solid-js";
import { useDraft } from "../../../context/DraftContext";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchBuildData } from "../../../lib/builds/data";

type Props = {
    team: string;
    index: number;
};

export const BuildView: Component<Props> = (props) => {
    const {
        allyTeam,
        opponentTeam,
        dataset,
        allyTeamComps,
        opponentTeamComps,
    } = useDraft();
    const team = () => (props.team === "ally" ? allyTeam : opponentTeam);
    const champion = () => team()[props.index];
    const opponentTeamComp = () =>
        props.team === "ally"
            ? opponentTeamComps()[0][0]
            : allyTeamComps()[0][0];

    const queryClient = useQueryClient();
    const query = createQuery(
        () => ["build", champion(), opponentTeamComp(), dataset()],
        async (ctx) => {
            if (
                champion().championKey == null ||
                !opponentTeamComp() ||
                !dataset()
            ) {
                return;
            }

            const cached = queryClient.getQueryCache().find(ctx.queryKey);
            if (cached?.state?.data && cached.state.error == null) {
                return cached.state.data;
            }

            return await fetchBuildData(
                dataset()!,
                champion().championKey!,
                champion().role!,
                opponentTeamComp()
            );
        },
        {
            refetchInterval: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
        }
    );
    createEffect(() => {
        if (query.isError) {
            console.error("Error while fetching build data", query.error);
        }
    });

    return (
        <>
            <Switch>
                <Match when={query.isLoading}>
                    <div class="text-neutral-50 text-2xl text-center grid place-items-center h-full">
                        Loading...
                    </div>
                </Match>
                <Match when={query.isError}>
                    <div class="text-red-500 text-2xl text-center grid place-items-center h-full">
                        Error while fetching build data
                    </div>
                </Match>
                <Match when={query.isSuccess}>
                    <pre>{JSON.stringify(query.data!, null, 2)}</pre>
                </Match>
            </Switch>
        </>
    );
};
