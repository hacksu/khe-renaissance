
<script lang="ts">
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import Button from "../components/Button.svelte";
    const returnDate = DateTime.fromFormat("02/15/2025", "dd/mm/yyyy").toRelativeCalendar();
</script>

<div class="h-[80vh] flex flex-col justify-center items-center gap-3 text-center">
    <h1 class="text-3xl">Kent Hack Enough will return <span class="font-bold">{returnDate}</span>...</h1>
    <div class="w-96">
        <Button on:click={() => goto("/apply")}> But you can apply now 🚀 </Button>
    </div>
</div>
