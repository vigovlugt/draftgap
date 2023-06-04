import {
    Component,
    createEffect,
    createSignal,
    JSX,
    on,
    onMount,
    splitProps,
} from "solid-js";

type Props = {
    value: number;
    formatFn?: (value: number) => string;
} & JSX.HTMLAttributes<HTMLSpanElement>;

export const CountUp: Component<Props> = (props) => {
    const [, other] = splitProps(props, ["value", "formatFn"]);
    // eslint-disable-next-line solid/reactivity
    const [currentValue, setCurrentValue] = createSignal(props.value);
    const [currentReqAnimFrame, setCurrentReqAnimFrame] = createSignal<
        number | null
    >(null);

    onMount(() => {
        createEffect(
            on(
                () => props.value,
                () => {
                    if (currentReqAnimFrame() !== null) {
                        cancelAnimationFrame(currentReqAnimFrame()!);
                    }

                    const previousTime = performance.now();

                    const targetValue = props.value;

                    const update = () => {
                        setCurrentReqAnimFrame(null);

                        const diff = targetValue - currentValue();
                        if (Math.abs(diff) < 0.0001) {
                            setCurrentValue(targetValue);
                            return;
                        }

                        const currentTime = performance.now();
                        const deltaTime = (currentTime - previousTime) / 1000;

                        const changeSign = diff > 0 ? 1 : -1;
                        const absoluteChange =
                            Math.abs(diff * deltaTime) ** 1.6;
                        let change = absoluteChange * changeSign;
                        if (Math.abs(change) > Math.abs(diff)) {
                            change = diff;
                        }

                        const newValue = currentValue() + change;
                        setCurrentValue(newValue);

                        const req = requestAnimationFrame(update);
                        setCurrentReqAnimFrame(req);
                    };

                    update();
                }
            )
        );
    });

    return (
        <span {...other}>
            {props.formatFn?.(currentValue()) ?? currentValue().toString()}
        </span>
    );
};
