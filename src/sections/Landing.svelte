
<script lang="ts">
    import moment from "moment";
    import Button from "../components/Button.svelte";
    const returnDate = moment("02/15/2025").fromNow(true);
</script>

<div class="h-[80vh] mx-[22vw] flex flex-col justify-center items-center gap-3">
    <h1 class="text-3xl">Kent Hack Enough will return <span class="font-bold">in {returnDate}</span>...</h1>
    <Button> But you can apply now 🚀 </Button>
</div>
