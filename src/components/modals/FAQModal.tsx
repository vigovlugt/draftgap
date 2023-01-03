import { Accessor, Setter, Component } from "solid-js";
import Modal from "../common/Modal";

type Props = {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

export const FAQModal: Component<Props> = ({ isOpen, setIsOpen }) => {
    return (
        <Modal title="FAQ" isOpen={isOpen} setIsOpen={setIsOpen} size="xl">
            <h2 class="text-4xl uppercase">What is DraftGap?</h2>
            <p class="font-body tracking-normal mb-4">
                DraftGap is a tool to help you pick the best champion for each
                situation. In the table, you can see all possible champions to
                pick, and their winrates when picked in this teamcomp.
            </p>

            <h2 class="text-4xl uppercase">How does this work?</h2>
            <p class="font-body tracking-normal mb-4">
                DraftGap analyzes a couple of statistics, the base winrates of
                champions, the winrates of duo's within each team and every
                matchup between the two teams. It calulates the winrate of each
                team comp after picking a possible champion, and shows this in
                the table. This method is based of the work of{" "}
                <a
                    href="https://www.youtube.com/@Jayensee"
                    class="text-blue-500"
                    target="_blank"
                >
                    Jayensee
                </a>{" "}
                and is explained in his{" "}
                <a
                    href="https://www.youtube.com/watch?v=YQkWmysNBt8"
                    class="text-blue-500"
                    target="_blank"
                >
                    great video
                </a>
                .
            </p>

            <h2 class="text-4xl uppercase">
                Does DraftGap have any shortcomings?
            </h2>
            <p class="font-body tracking-normal mb-4">
                DraftGap is not perfect, and there are several things to keep in
                mind when using it. First of all, the data is based on the last
                30 days, so it is not a perfect representation of the current
                meta. Secondly, the overall team comp identity is not taken into
                account. The synergy of duos within a team are used in the
                calculations, but the tool does not know about team comp
                identity like 'engage' or 'poke'. We also do not look at the
                damage composition (but it is shown, above the team winrate), so
                you need to keep this in mind on you own.
                <br />
                These shortcomings result from the fact that there is not enough
                data to make a perfect prediction. And I do not want to
                incorporate opinions like 'bard is a engage champion' into the
                tool, as using just data is the most objective way to make a
                decision.
            </p>

            <h2 class="text-4xl uppercase">Where is the data from?</h2>
            <p class="font-body tracking-normal mb-4">
                The data used are the current Plat+{" "}
                <a
                    href="https://lolalytics.com"
                    class="text-blue-500"
                    target="_blank"
                >
                    Lolalytics
                </a>{" "}
                solo/duo winrates from all regions of the last 30 days. The data
                is updated every 24 hours.
            </p>

            <p class="font-body tracking-normal font-bold">
                If you have any other questions, feedback, bug reports or
                feature requests, feel free to send an email to:{" "}
                <a
                    href="mailto:vigovlugt+draftgap@gmail.com"
                    class="text-blue-500 font-normal"
                    target="_blank"
                >
                    vigovlugt+draftgap@gmail.com
                </a>
            </p>
        </Modal>
    );
};
