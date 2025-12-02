<script lang="ts">
    import Input from "$components/form/Input.svelte";
import Link from "$components/Link.svelte";
    import Accordion from "../components/Accordion.svelte";
    import Card from "../components/Card.svelte";

    

</script>

<div id="faq" class="flex flex-col gap-2 items-center">
    <div class="w-full">
        <Card>
            <Accordion>
                {#snippet name()}What is a hackathon?{/snippet}
                {#snippet content()}
                    <p>A hackathon is a weekend-long event to meet smart creative people, make connections, learn, and build something awesome!</p>
                    <br />
                    <p>Attendees meet on Saturday, make a team, and have 24 hours to build a tech-related project. There will be optional lessons and talks, sponsors looking to hire smart, motivated people, and tons of free stuff!</p>
                    <br />
                    <p>Then on Sunday, teams will present their projects to a panel of judges.</p>
                    <p>We even have a nicely written guide for this, you can <Link href="/guide" target="_self">view it here</Link>!</p>
                    <br />
                    <br />
                    <p><i>Note: This is a Major League Hacking (MLH) event, which means that it and all attendees are subject to the <Link href="https://mlh.io/code-of-conduct" target="_blank">MLH Code of Conduct</Link>.</i></p>
                {/snippet}
            </Accordion>
            <Accordion>
                {#snippet name()}Can I participate?{/snippet}
                {#snippet content()}
                    <p>If you're a college student, working professional, or anyone over 18, then yes! KHE is attended by people of all skill levels and backgrounds. You'll fit right in and hopefully, learn something!</p>
                {/snippet}
            </Accordion>
            <Accordion>
                {#snippet name()}Sounds cool, but how much does it cost?{/snippet}
                {#snippet content()}
                    <p>$0.00!</p>
                    <p>Thanks to the generosity of our sponsors, we're able to put on events like this for free. We even pay for your meals for the weekend! Make sure to thank our sponsors - we couldn't do it without them!</p>
                {/snippet}
            </Accordion>
            <Accordion>
                {#snippet name()}What should I bring?{/snippet}
                {#snippet content()}
                    <p>Bring a laptop/something to hack on, a change of clothes, deodorant, a blanket/pillow, toiletries, and anything else you think you might use to complete your project.</p>
                {/snippet}
            </Accordion>
            <Accordion>
                {#snippet name()}Do I need to come with a team?{/snippet}
                {#snippet content()}
                    <p>You can, but you don't have to! We'll have team building at the event.</p>
                {/snippet}
            </Accordion>
            <Accordion>
                {#snippet name()}How many people per team?{/snippet}
                {#snippet content()}
                    <p>There's a hard limit of 4 participants per team.</p>
                {/snippet}
            </Accordion>
        </Card>
    </div>
</div>
