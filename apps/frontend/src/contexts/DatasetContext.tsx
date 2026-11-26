import {
    JSXElement,
    createContext,
    createEffect,
    useContext,
} from "solid-js";
import {
    DATASET_VERSION,
    Dataset,
} from "@draftgap/core/src/models/dataset/Dataset";
import { createQuery } from "@tanstack/solid-query";

type DatasetName = "30-days" | "current-patch";

const fetchDataset = async (name: DatasetName) => {
    const response = await fetch(
        `https://bucket.draftgap.com/datasets/v${DATASET_VERSION}/${name}.json`,
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch dataset ${name}: ${response.status}`);
    }
    return (await response.json()) as Dataset;
};

// Solid Query keeps query results in a Solid store, which deep-walks plain
// objects with `unwrap` on every update. For the 30-days dataset that takes
// ~600ms, so wrap the dataset in a class instance, which the store skips.
class DatasetRef {
    constructor(readonly value: Dataset) {}
}

// Module-level so the reference is stable and Solid Query memoizes the result.
const selectDatasetRef = (dataset: Dataset) => new DatasetRef(dataset);

function createDatasetQuery(name: DatasetName) {
    return createQuery(() => ({
        queryKey: ["dataset", DATASET_VERSION, name],
        queryFn: () => fetchDataset(name),
        select: selectDatasetRef,
        // Persisted to IndexedDB (see index.tsx): the cached dataset is shown
        // immediately and revalidated in the background on every app load.
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    }));
}

function createDatasetContext() {
    const datasetQuery = createDatasetQuery("current-patch");
    const dataset30DaysQuery = createDatasetQuery("30-days");

    const dataset = () => datasetQuery.data?.value;
    const dataset30Days = () => dataset30DaysQuery.data?.value;

    const isError = () =>
        (datasetQuery.isError && !datasetQuery.data) ||
        (dataset30DaysQuery.isError && !dataset30DaysQuery.data);

    const isLoaded = () =>
        dataset() !== undefined && dataset30Days() !== undefined;

    createEffect(() => {
        (window as any).DRAFTGAP_DEBUG = (window as any).DRAFTGAP_DEBUG || {};
        (window as any).DRAFTGAP_DEBUG.dataset = dataset;
        (window as any).DRAFTGAP_DEBUG.dataset30Days = dataset30Days;
    });

    return {
        dataset,
        dataset30Days,
        isLoaded,
        isError,
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
