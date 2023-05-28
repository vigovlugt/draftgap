import { VariantProps, cva } from "class-variance-authority";
import { JSX, splitProps } from "solid-js";
import { cn } from "../../utils/style";

export const buttonVariants = cva(
    "uppercase relative inline-flex items-center border font-medium rounded-md",
    {
        variants: {
            variant: {
                primary: "bg-white border-0 text-primary hover:bg-neutral-200",
                secondary:
                    "text-neutral-300 border-neutral-700 bg-primary hover:bg-neutral-800",
            },
            size: {
                default: "px-4 py-1 text-xl",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

type Props = JSX.HTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

export function Button(props: Props) {
    const [local, other] = splitProps(props, ["children", "variant", "size"]);

    return (
        <button {...other} class={cn(buttonVariants(local), props.class)}>
            {local.children}
        </button>
    );
}
