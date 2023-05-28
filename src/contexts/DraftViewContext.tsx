import { JSXElement, createContext, createSignal, useContext } from "solid-js";

type DraftView =
    | {
          type: "draft";
          subType: "ally" | "opponent" | "draft";
      }
    | {
          type: "analysis";
      }
    | {
          type: "builds";
      };

function createDraftViewContext() {
    const [currentDraftView, setCurrentDraftView] = createSignal<DraftView>({
        type: "draft",
        subType: "ally",
    });

    return {
        currentDraftView,
        setCurrentDraftView,
    };
}

const DraftViewContext =
    createContext<ReturnType<typeof createDraftViewContext>>();

export function DraftViewProvider(props: { children: JSXElement }) {
    const ctx = createDraftViewContext();

    return (
        <DraftViewContext.Provider value={ctx}>
            {props.children}
        </DraftViewContext.Provider>
    );
}

export const useDraftView = () => {
    const useCtx = useContext(DraftViewContext);
    if (!useCtx) throw new Error("No DraftViewContext found");

    return useCtx;
};
