import { createRef } from "solid-headless/dist/types/utils/dynamic-prop";
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
    const [local, other] = splitProps(props, ["value", "formatFn"]);
    const [currentValue, setCurrentValue] = createSignal(props.value);

    onMount(() => {
        createEffect(
            on(
                () => props.value,
                () => {
                    let previousTime = performance.now();

                    const targetValue = props.value;

                    const update = () => {
                        const diff = targetValue - currentValue();
                        if (Math.abs(diff) < 0.0001) {
                            setCurrentValue(targetValue);
                            return;
                        }

                        const currentTime = performance.now();
                        const deltaTime = (currentTime - previousTime) / 1000;

                        let change = (diff * deltaTime) / 20;
                        if (Math.abs(change) > Math.abs(diff)) {
                            change = diff;
                        }

                        const newValue = currentValue() + change;
                        setCurrentValue(newValue);

                        requestAnimationFrame(update);
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
