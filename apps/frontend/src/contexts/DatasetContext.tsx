import {
    JSXElement,
    createContext,
    createEffect,
    createResource,
    useContext,
} from "solid-js";
import {
    DATASET_VERSION,
    Dataset,
} from "@draftgap/core/src/models/dataset/Dataset";
import { EloBracket } from "@draftgap/core/src/models/rank/elo-bracket";
import { useUser } from "./UserContext";

type DatasetKey = { tier: EloBracket; name: "30-days" | "current-patch" };

const fetchDataset = async ({ tier, name }: DatasetKey) => {
    try {
        const response = await fetch(
            `https://bucket.draftgap.com/datasets/v${DATASET_VERSION}/${tier}/${name}.json`,
        );
        const json = await response.json();
        return json as Dataset;
    } catch (err) {
        console.error(err);
        return undefined;
    }
};

function createDatasetContext() {
    const { config } = useUser();

    const [dataset] = createResource(
        () => ({ tier: config.eloBracket, name: "current-patch" as const }),
        fetchDataset,
    );

    const [dataset30Days] = createResource(
        () => ({ tier: config.eloBracket, name: "30-days" as const }),
        fetchDataset,
    );

    const isLoaded = () =>
        dataset() !== undefined && dataset30Days() !== undefined;

    createEffect(() => {
        (window as any).DRAFTGAP_DEBUG = (window as any).DRAFTGAP_DEBUG || {};
        // eslint-disable-next-line solid/reactivity
        (window as any).DRAFTGAP_DEBUG.dataset = dataset;
        // eslint-disable-next-line solid/reactivity
        (window as any).DRAFTGAP_DEBUG.dataset30Days = dataset30Days;
    });

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
