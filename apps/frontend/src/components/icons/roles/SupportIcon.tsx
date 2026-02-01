import { JSX } from "solid-js";

export default function SupportIcon(
    props: JSX.SvgSVGAttributes<SVGSVGElement>,
) {
    return (
        <svg viewBox="0 0 31 31" {...props}>
            <g
                fill="currentColor"
                fill-rule="evenodd"
                transform="translate(1.5 4)"
            >
                <polygon points="14.089 22.953 18.041 19.779 14.089 9.976 10.121 19.779" />
                <polygon points="8.841 13.988 11.786 8.453 9.102 6 0 6 7.895 9.466 5.868 11.388" />
                <polygon
                    points="25.341 13.988 28.286 8.453 25.602 6 16.5 6 24.395 9.466 22.368 11.388"
                    transform="matrix(-1 0 0 1 44.786 0)"
                />
                <polygon points="13.992 7.007 18.044 2.955 16.04 .951 12.009 .951 10.025 2.934" />
            </g>
        </svg>
    );
}
