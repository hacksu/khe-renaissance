<script lang="ts">
    import Shield from "../assets/castle/shield.svg";
</script>

<section class="intro" id="about" aria-labelledby="about-title">
    <h2 id="about-title">Kent Hack Enough</h2>
    <div class="intro-copy">
        <img class="shield" src={Shield} alt="" />
        <p>Kent Hack Enough storms the gates this year with our theme: <strong>Hack the Kingdom.</strong>
            Sharpen your swords, marshal your code, and rule the kingdom!</p>
        <p>This is our <strong>14th KHE!</strong> Whether you're <strong>completely new</strong> to tech &amp; design
            or a <strong>seasoned veteran</strong>, spend a weekend making something legendary with us.</p>
    </div>
</section>

<style>
    .intro { display: grid; grid-template-columns: 1fr 1fr; gap: 90px; padding: 88px 0; }
    h2 { margin: 0; color: var(--paper); font-size: 39px; line-height: 1.15; }
    .intro-copy { position: relative; padding-right: 85px; }
    p { margin: 0 0 16px; color: var(--muted); font-size: 16px; line-height: 1.65; }
    p:last-child { margin-bottom: 0; }
    strong { color: var(--paper); font-weight: 400; }
    .shield { position: absolute; top: 0; right: 0; width: 59px; height: auto; }
    @media (max-width: 1100px) { .intro { gap: 55px; } }
    @media (max-width: 760px) {
        .intro { grid-template-columns: 1fr; gap: 28px; padding: 43px 0; }
        h2 { font-size: 31px; }
        .intro-copy { padding-right: 65px; }
        .shield { width: 43px; }
    }
</style>
