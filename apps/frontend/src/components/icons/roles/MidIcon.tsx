import { JSX } from "solid-js/jsx-runtime";

export default function MidIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 31 31" {...props}>
            <g
                fill="currentColor"
                fill-rule="evenodd"
                transform="translate(4.5 4.5)"
            >
                <polygon
                    fill-opacity=".3"
                    points="0 0 14.519 0 10.484 4 3.997 4 3.997 10.523 0 14.491"
                />
                <polygon
                    fill-opacity=".3"
                    points="7.5 7.5 22.019 7.5 17.984 11.5 11.497 11.5 11.497 18.023 7.5 21.991"
                    transform="rotate(-180 14.76 14.746)"
                />
                <polygon points="18 0 22 0 22 4 4 22 0 22 0 18" />
            </g>
        </svg>
    );
}
