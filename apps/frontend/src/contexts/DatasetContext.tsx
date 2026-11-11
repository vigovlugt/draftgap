import {
    JSXElement,
    batch,
    createContext,
    createEffect,
    createResource,
    createSignal,
    useContext,
} from "solid-js";
import { invoke, isTauri } from "@tauri-apps/api/core";
import {
    DATASET_VERSION,
    Dataset,
    FULL_DATASET_NAME,
} from "@draftgap/core/src/models/dataset/Dataset";
import { createErrorToast } from "../utils/toast";

type DatasetName = typeof FULL_DATASET_NAME | "current-patch";

// Datasets are generated into the public directory by the dataset app (bun run dataset)
const DATASET_URL = import.meta.env.VITE_DATASET_URL ?? "";

// A failed refresh is not tried again on every opening of the app
const REFRESH_ATTEMPT_KEY = "draftgap-dataset-refresh-attempt";
const REFRESH_RETRY_MS = 1000 * 60 * 60;

const getDatasetPath = (name: DatasetName) =>
    `datasets/v${DATASET_VERSION}/${name}.json`;

const isFromToday = (dataset: Dataset) =>
    new Date(dataset.date).toDateString() === new Date().toDateString();

// The desktop app reads the generated datasets from disk, so they can be refreshed without rebuilding it
const readDatasetFromDisk = async (name: DatasetName) => {
    try {
        const bytes = await invoke<ArrayBuffer>("read_dataset", {
            path: getDatasetPath(name),
        });
        return JSON.parse(new TextDecoder().decode(bytes)) as Dataset;
    } catch (err) {
        console.warn("Using the bundled dataset:", err);
        return undefined;
    }
};

const fetchDataset = async (name: DatasetName) => {
    try {
        const diskDataset = isTauri()
            ? await readDatasetFromDisk(name)
            : undefined;
        if (diskDataset) return diskDataset;

        const response = await fetch(`${DATASET_URL}/${getDatasetPath(name)}`);
        const json = await response.json();
        return json as Dataset;
    } catch (err) {
        console.error(err);
        return undefined;
    }
};

function createDatasetContext() {
    const [dataset, { mutate: setDataset }] = createResource(
        "current-patch",
        fetchDataset,
    );

    const [fullDataset, { mutate: setFullDataset }] = createResource(
        FULL_DATASET_NAME,
        fetchDataset,
    );

    const isLoaded = () =>
        dataset() !== undefined && fullDataset() !== undefined;

    const [isRefreshing, setIsRefreshing] = createSignal(false);

    // The desktop app regenerates the datasets on the first opening of the day.
    // The new datasets only replace the current ones when canApply allows it, as the app is in use meanwhile.
    async function refreshDaily(canApply: (dataset: Dataset) => boolean) {
        if (!isTauri() || isRefreshing()) return;
        if (!dataset() || isFromToday(dataset()!)) return;

        const lastAttempt = Number(localStorage.getItem(REFRESH_ATTEMPT_KEY));
        if (Date.now() - lastAttempt < REFRESH_RETRY_MS) return;
        localStorage.setItem(REFRESH_ATTEMPT_KEY, Date.now().toString());

        setIsRefreshing(true);
        try {
            await invoke("refresh_dataset");

            const [newDataset, newFullDataset] = await Promise.all([
                readDatasetFromDisk("current-patch"),
                readDatasetFromDisk(FULL_DATASET_NAME),
            ]);
            if (newDataset && newFullDataset && canApply(newDataset)) {
                batch(() => {
                    setDataset(newDataset);
                    setFullDataset(newFullDataset);
                });
            }
        } catch (err) {
            console.error("Could not refresh the datasets:", err);
            createErrorToast("Could not update the data, using older data.");
        } finally {
            setIsRefreshing(false);
        }
    }

    createEffect(() => {
        (window as any).DRAFTGAP_DEBUG = (window as any).DRAFTGAP_DEBUG || {};
        // eslint-disable-next-line solid/reactivity
        (window as any).DRAFTGAP_DEBUG.dataset = dataset;
        // eslint-disable-next-line solid/reactivity
        (window as any).DRAFTGAP_DEBUG.fullDataset = fullDataset;
    });

    return {
        dataset,
        fullDataset,
        isLoaded,
        isRefreshing,
        refreshDaily,
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
