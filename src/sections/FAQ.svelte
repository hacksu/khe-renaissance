<script lang="ts">
    import Link      from "$components/Link.svelte";
    import Accordion from "../components/Accordion.svelte";
</script>

<div id="faq" class="flex flex-col gap-8">

    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">Knowledge Vault</p>
        <h2 class="text-5xl font-black text-castle-gold" style="text-shadow: 0 0 30px rgba(201,168,76,0.4);">
            FAQ
        </h2>
    </div>

    <div class="faq-panel">
        <Accordion>
            {#snippet name()}What is a hackathon?{/snippet}
            {#snippet content()}
                <p>A hackathon is a weekend-long event to meet smart creative people, make connections, learn, and build something awesome!</p>
                <br />
                <p>Attendees meet on Saturday, form a team, and have 24 hours to build a tech-related project. There are optional workshops, sponsor tables, and plenty of free stuff!</p>
                <br />
                <p>On Sunday, teams present to a panel of judges. We even have a guide: <Link href="/guide" target="_self">view it here</Link>.</p>
                <br />
                <p><i>KHE is a Major League Hacking event. All attendees are subject to the <Link href="https://mlh.io/code-of-conduct" target="_blank">MLH Code of Conduct</Link>.</i></p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}What can I make?{/snippet}
            {#snippet content()}
                <p><span class="text-xs">(almost)</span> <strong class="text-white">ANYTHING!</strong> as long as it is generally tech adjacent. To see past projects for examples on what you could make, check out the <Link href="/guide" target="_self">guide></Link>.</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}Can I participate?{/snippet}
            {#snippet content()}
                <p><strong class="text-lg text-castle-torchOrange">YES!</strong> KHE welcomes all skill levels and backgrounds. You'll fit right in.</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}How much does it cost?{/snippet}
            {#snippet content()}
                <p><strong class="text-castle-torchYellow">$0.00.</strong></p>
                <p>Thanks to our generous sponsors, the event is completely free! Meals included. Make sure to thank them!</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}What should I bring?{/snippet}
            {#snippet content()}
                <p><strong class="text-white">Laptop</strong>, <strong class="text-white">charger</strong>, <strong class="text-white">water bottle</strong>, a change of clothes, <strong>deodorant</strong>, a blanket or pillow, toiletries, and anything you'd need for your project.</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}Do I need to come with a team?{/snippet}
            {#snippet content()}
                <p>Nope! We run team-building activities at the start of the event. Solo adventurers are very welcome.</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}How many people per team?{/snippet}
            {#snippet content()}
                <p>Hard limit of <strong class="text-white">4 participants</strong> per team, but you could compete with 1, 2, or 3 members as well!</p>
            {/snippet}
        </Accordion>
        <Accordion>
            {#snippet name()}What is judging based on?{/snippet}
            {#snippet content()}
                <p>Excellent question!! We do category based judging. To see the most updated version of the information that we give to our judges, check out this <Link href="https://github.com/hacksu/Hackathon-Judging-Guide" target="_self">judging guide</Link>.</p>
            {/snippet}
        </Accordion>
    </div>
</div>

<style>
    .eyebrow {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.5em; font-weight: 600; color: #ffb347;
    }

    .faq-panel {
        background: linear-gradient(160deg, #2a2a38 0%, #1e1e2c 100%);
        border: 1px solid rgba(74, 74, 92, 0.5);
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 40px rgba(0,0,0,0.4);
    }
</style>
