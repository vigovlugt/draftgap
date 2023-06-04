import { JSX } from "solid-js/jsx-runtime";

export default function BottomIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 31 31" {...props}>
            <g
                fill="currentColor"
                fill-rule="evenodd"
                transform="translate(4.5 4.5)"
            >
                <polygon points="22.063 3 22.063 21.969 3 21.969 7.053 17.936 18.063 17.969 17.999 7.044" />
                <polygon
                    fill-opacity=".3"
                    points="0 0 14.593 0 19.109 0 15.089 4.011 4.002 4 4.002 15.076 0 19.07 0 14.491"
                />
                <rect width="6" height="6" x="8" y="8" fill-opacity=".3" />
            </g>
        </svg>
    );
}
