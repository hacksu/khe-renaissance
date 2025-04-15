<script lang="ts">
    import NavbarItem from "./NavbarItem.svelte";

    let toggled = $state(false);
</script>

<div class="absolute w-full flex flex-row p-5 justify-between bg-gray-950 text-white">
    <div>Kent Hack Enough</div>
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3">
        <NavbarItem href="#home">Home</NavbarItem>
        <NavbarItem href="#faq">FAQ</NavbarItem>
        <NavbarItem href="#guide">Guide</NavbarItem>
        <NavbarItem href="#sponsors">Sponsors</NavbarItem>
        <NavbarItem href="#contact">Contact</NavbarItem>
        <NavbarItem href="#schedule">Schedule</NavbarItem>
        <NavbarItem href="#profile">Profile</NavbarItem>
    </div>

    <div class="md:hidden w-auto flex flex-col md:flex-row gap-3">
        {#if toggled}
            <NavbarItem href="#home">Home</NavbarItem>
            <NavbarItem href="#faq">FAQ</NavbarItem>
            <NavbarItem href="#guide">Guide</NavbarItem>
            <NavbarItem href="#sponsors">Sponsors</NavbarItem>
            <NavbarItem href="#contact">Contact</NavbarItem>
            <NavbarItem href="#schedule">Schedule</NavbarItem>
            <NavbarItem href="#profile">Profile</NavbarItem>
        {/if}
        <button onclick={() => (toggled = !toggled)}>🚀</button>
    </div>
</div>
