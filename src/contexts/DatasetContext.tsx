import {
    JSXElement,
    createContext,
    createEffect,
    createResource,
    useContext,
} from "solid-js";
import { DATASET_VERSION, Dataset } from "../lib/models/dataset/Dataset";

const fetchDataset = async (name: "30-days" | "current-patch") => {
    try {
        console.time(`fetch dataset ${name}`);
        const response = await fetch(
            `https://bucket.draftgap.com/datasets/v${DATASET_VERSION}/${name}.json`
        );
        console.timeEnd(`fetch dataset ${name}`);
        console.time(`parse dataset ${name}`);
        const json = await response.json();
        console.timeEnd(`parse dataset ${name}`);
        return json as Dataset;
    } catch (err) {
        return undefined;
    }
};

function createDatasetContext() {
    const [dataset] = createResource("current-patch", fetchDataset);
    createEffect(() => {
        console.log("dataset", dataset.state, dataset());
    });

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
