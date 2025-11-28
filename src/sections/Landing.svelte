
<script lang="ts">
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    const day = "March 28-29th, 2026" 
    import Button from "../components/Button.svelte";
    // const returnDate = DateTime.fromFormat("03/28/2026", "MM/dd/yyyy").toRelativeCalendar();
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center">
    <h1 class="text-4xl">Kent Hack Enough returns <span class="font-bold">{day}</span></h1>
    <div class="flex flex-col md:flex-row gap-3 w-96">
        <Button size="lg" onclick={() => goto("/auth/login")}>Apply now!</Button>
        <Button size="lg" onclick={() => goto("/schedule")}>View Schedule</Button>
    </div>
</div>
