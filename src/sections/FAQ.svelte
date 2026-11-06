<section id="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">FAQ</h2>

    <details open>
        <summary>What is a hackathon?</summary>
        <p>A hackathon is a weekend-long event to meet smart creative people, make connections, learn, and build something awesome!</p>
        <p>Attendees meet on Saturday, form a team, and have 24 hours to build a tech-related project. There are optional workshops, sponsor tables, and plenty of free stuff!</p>
        <p>On Sunday, teams present to a panel of judges. We even have a guide: <a href="/guide">view it here</a>.</p>
        <p><i>KHE is a Major League Hacking event. All attendees are subject to the <a href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer">MLH Code of Conduct</a>.</i></p>
    </details>
    <details open>
        <summary>What can I make?</summary>
        <p><span class="almost">(almost)</span> <strong>ANYTHING!</strong> as long as it is generally tech adjacent. To see past projects for examples on what you could make, check out the <a href="/guide">guide</a>.</p>
    </details>
    <details open>
        <summary>Can I participate?</summary>
        <p><strong>YES!</strong> KHE welcomes all skill levels and backgrounds. You'll fit right in.</p>
    </details>
    <details open>
        <summary>How much does it cost?</summary>
        <p><strong>$0.00.</strong></p>
        <p>Thanks to our generous sponsors, the event is completely free! Meals included. Make sure to thank them!</p>
    </details>
    <details open>
        <summary>What should I bring?</summary>
        <p><strong>Laptop</strong>, <strong>charger</strong>, <strong>water bottle</strong>, a change of clothes, <strong>deodorant</strong>, a blanket or pillow, toiletries, and anything you'd need for your project.</p>
    </details>
    <details open>
        <summary>Do I need to come with a team?</summary>
        <p>Nope! We run team-building activities at the start of the event. Solo adventurers are very welcome.</p>
    </details>
    <details open>
        <summary>How many people per team?</summary>
        <p>Hard limit of <strong>4 participants</strong> per team, but you could compete with 1, 2, or 3 members as well!</p>
    </details>
    <details open>
        <summary>What is judging based on?</summary>
        <p>Excellent question!! We do category based judging. To see the most updated version of the information that we give to our judges, check out this <a href="https://github.com/hacksu/Hackathon-Judging-Guide">judging guide</a>.</p>
    </details>
</section>

<style>
    section {
        min-width: 0;
        color: var(--paper);
    }

    h2 {
        margin: 0 0 28px;
        font-size: 39px;
        font-weight: 400;
        line-height: 1.15;
        letter-spacing: -0.025em;
    }

    details {
        padding: 18px 0;
    }

    summary {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        list-style: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.5;
    }

    summary::-webkit-details-marker {
        display: none;
    }

    summary::after {
        content: "+";
        flex-shrink: 0;
        color: var(--muted);
    }

    details[open] summary::after {
        content: "-";
    }

    p {
        margin: 14px 0 0;
        padding-right: 22px;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.65;
        overflow-wrap: anywhere;
    }

    strong,
    a {
        color: var(--paper);
    }

    a {
        text-decoration: underline;
        text-underline-offset: 4px;
    }

    a:hover {
        text-decoration-thickness: 2px;
    }

    a:focus-visible,
    summary:focus-visible {
        outline: 2px solid #e6c78b;
        outline-offset: 6px;
    }

    .almost {
        font-size: 12px;
    }

    @media (max-width: 760px) {
        h2 {
            margin-bottom: 24px;
            font-size: 31px;
        }

        details {
            padding: 17px 0;
        }

        summary {
            font-size: 13px;
        }
    }
</style>
