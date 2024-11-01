<script lang="ts">
    import Accordion from "../components/Accordion.svelte";
    import Card from "../components/Card.svelte";

</script>

<div class="flex flex-col gap-2 items-center">
    <div class="w-1/3">
        <h3 class="font-bold text-xl">FREQUENTLY ASKED QUESTIONS</h3>
    </div>
    <div class="w-1/3">
        <Card>
            <Accordion>
                <div slot="name">What is a hackathon?</div>
                <div slot="content">
                    <p>A hackathon is a weekend-long event to meet smart creative people, make connections, learn, and build something awesome!</p>
                    <br />
                    <p>Attendees meet on Saturday, make a team, and have 24 hours to build a tech-related project. There will be optional lessons and talks, sponsors looking to hire smart, motivated people, and tons of free stuff!</p>
                </div>
            </Accordion>
            <Accordion>
                <div slot="name">Can I participate?</div>
                <div slot="content">
                    <p>If you're a college student of any kind, then yes! KHE is attended by people of all skill levels and backgrounds. You'll fit right in and hopefully, learn something!</p>
                </div>
            </Accordion>
            <Accordion>
                <div slot="name">Can I participate?</div>
                <div slot="content">
                    <p>$0.00!</p>
                    <p>Thanks to the generosity of our sponsors, we're able to put on events like this for free. We even pay for your meals for the weekend! Make sure to thank our sponsors - we couldn't do it without them!</p>
                </div>
            </Accordion>
            <Accordion>
                <div slot="name">What should I bring?</div>
                <div slot="content">
                    <p>Bring a laptop/something to hack on, a change of clothes, deodorant, a blanket/pillow, toiletries, and anything else you think you might use to complete your project.</p>
                </div>
            </Accordion>
            <Accordion>
                <div slot="name">Do I need to come with a team?</div>
                <div slot="content">
                    <p>You can, but you don't have to! We'll have team building at the event.</p>
                </div>
            </Accordion>
            <Accordion>
                <div slot="name">How many people per team?</div>
                <div slot="content">
                    <p>There's a hard limit of 4 participants per team.</p>
                </div>
            </Accordion>
        </Card>
    </div>
</div>
