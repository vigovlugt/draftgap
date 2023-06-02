import {
    JSXElement,
    createContext,
    createResource,
    useContext,
} from "solid-js";
import { DATASET_VERSION, Dataset } from "../lib/models/dataset/Dataset";

const fetchDataset = async (name: "30-days" | "current-patch") => {
    try {
        const response = await fetch(
            `https://bucket.draftgap.com/datasets/v${DATASET_VERSION}/${name}.json`
        );
        const json = await response.json();
        return json as Dataset;
    } catch (err) {
        return undefined;
    }
};

function createDatasetContext() {
    const [dataset] = createResource("current-patch", fetchDataset);

    const [dataset30Days] = createResource("30-days", fetchDataset);

    const isLoaded = () =>
        dataset() !== undefined && dataset30Days() !== undefined;

    return {
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
