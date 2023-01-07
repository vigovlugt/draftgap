import { Component } from "solid-js";
import { formatRating, getRatingClass } from "../../utils/rating";

type Props = {
    rating: number;
};

export const RatingText: Component<Props> = (props) => {
    return (
        <span class={`${getRatingClass(props.rating)}`}>
            {formatRating(props.rating)}
        </span>
    );
};
