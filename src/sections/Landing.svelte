
<script lang="ts">
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import Button from "../components/Button.svelte";
    const returnDate = DateTime.fromFormat("03/28/2026", "dd/mm/yyyy").toRelativeCalendar();
    // const returnDate = "in March";
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center">
    <h1 class="text-3xl">Kent Hack Enough will return <span class="font-bold">{returnDate}</span>...</h1>
    <div class="w-96">
        <Button size="lg" onclick={() => goto("/login")}>Apply now</Button>
    </div>
</div>
