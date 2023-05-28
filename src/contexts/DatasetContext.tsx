import { JSXElement, createContext, createEffect, useContext } from "solid-js";
import { DATASET_VERSION, Dataset } from "../lib/models/dataset/Dataset";
import { createQuery } from "@tanstack/solid-query";

const fetchDataset = async (name: "30-days" | "current-patch") => {
    console.time(`fetch dataset ${name}`);
    const response = await fetch(
        `https://bucket.draftgap.com/datasets/v${DATASET_VERSION}/${name}.json`
    );
    console.timeEnd(`fetch dataset ${name}`);
    console.time(`parse dataset ${name}`);
    const json = await response.json();
    console.timeEnd(`parse dataset ${name}`);
    return json as Dataset;
};

function createDatasetContext() {
    const datasetQuery = createQuery({
        queryKey: () => ["dataset", "current-patch"],
        queryFn: async () => {
            const dataset = await fetchDataset("current-patch");
            return dataset;
        },
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const dataset30DaysQuery = createQuery({
        queryKey: () => ["dataset", "30-days"],
        queryFn: async () => await fetchDataset("30-days"),
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const dataset = () => datasetQuery.data;

    const dataset30Days = () => dataset30DaysQuery.data;

    const isLoaded = () =>
        dataset() !== undefined && dataset30Days() !== undefined;

    return {
        datasetQuery,
        dataset30DaysQuery,
        dataset,
        dataset30Days,
        isLoaded,
    };
}

const DatasetContext = createContext<ReturnType<typeof createDatasetContext>>();

export function DatasetProvider(props: { children: JSXElement }) {
    return (
        <DatasetContext.Provider value={createDatasetContext()}>
            {props.children}
        </DatasetContext.Provider>
    );
}

export function useDataset() {
    const useCtx = useContext(DatasetContext);
    if (!useCtx) throw new Error("No DatasetContext found");

    return useCtx;
}
