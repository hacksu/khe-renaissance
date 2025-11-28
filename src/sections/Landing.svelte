
<script lang="ts">
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import Button from "../components/Button.svelte";
    const returnDate = DateTime.fromFormat("03/15/2026", "dd/mm/yyyy").toRelativeCalendar();
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center">
    <h1 class="text-4xl">Kent Hack Enough will return <span class="font-bold">{returnDate}</span>...</h1>
    <div class="flex flex-col md:flex-row gap-3 w-96">
        <Button size="lg" onclick={() => goto("/auth/login")}>Apply now!</Button>
        <Button size="lg" onclick={() => goto("/schedule")}>View Schedule</Button>
    </div>
</div>
