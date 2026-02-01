import { DialogContent, DialogHeader, DialogTitle } from "../common/Dialog";

export function FAQDialog() {
    return (
        <DialogContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>FAQ</DialogTitle>
            </DialogHeader>
            <div>
                <h2 class="text-2xl uppercase">What is DraftGap?</h2>
                <p class="font-body">
                    DraftGap is a tool to help you pick the best champion for
                    each situation. In the table, you can see all possible
                    champions to pick, and their winrates when picked in this
                    teamcomp.
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">How does this work?</h2>
                <p class="font-body">
                    DraftGap analyzes a couple of statistics, the base winrates
                    of champions, the winrates of duo's within each team and
                    every matchup between the two teams. It calulates the
                    winrate of each team comp after picking a possible champion,
                    and shows this in the table. This method is based of the
                    work of{" "}
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
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    Does DraftGap have any shortcomings?
                </h2>
                <p class="font-body">
                    DraftGap is not perfect, and there are several things to
                    keep in mind. The overall team comp identity is not taken
                    into account. The synergy of duos within a team are used in
                    the calculations, but the tool does not know about team comp
                    identity like 'engage' or 'poke'. Damage composition is also
                    not used in the calculation (but it is shown, above the team
                    winrate), so you need to keep this in mind on you own.
                    <br />
                    These shortcomings result from the fact that there is not
                    enough data to make a perfect prediction. And we do not want
                    to incorporate opinions like 'malphite is an engage
                    champion' into the tool, as using just data is the most
                    objective way to make a decision.
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">Where is the data from?</h2>
                <p class="font-body">
                    The data used are the current Emerald+{" "}
                    <a
                        href="https://lolalytics.com"
                        class="text-blue-500"
                        target="_blank"
                    >
                        Lolalytics
                    </a>{" "}
                    solo/duo winrates from all regions of the last 30 days. The
                    data is updated every 12 hours.
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase">
                    Why can I not filter data based on rank?
                </h2>
                <p class="font-body">
                    Since we are using data from Lolalytics, adding more ranks
                    to filter on will result in more than doubling the cost we
                    are imposing on Lolalytics. We do not want to impose any
                    more cost than we already are, thus we only support data for
                    one rank. Besides this reason, allowing for filtering by
                    higher ranks will also result in a lot more data sample size
                    issues, resulting in less accurate predictions.
                </p>
            </div>

            <div>
                <h2 class="text-2xl uppercase" id="faq-risk-level">
                    How does the risk level work?
                </h2>
                <p class="font-body">
                    The risk level is a measure of how much to trust small
                    sample sizes in the data. The higher the risk level, the
                    more it will recommend duos/matchups that have a small
                    sample size, and thus could be inaccurate. On the other
                    hand, it will also recommend more niche duos/counters that
                    are not seen often, but could be very strong.
                </p>
            </div>

            <p class="font-body font-bold">
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
        </DialogContent>
    );
}
