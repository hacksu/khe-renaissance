<script lang="ts">
    import NavbarItem from "./NavbarItem.svelte";

    let toggled = false;
</script>

<div class="absolute w-full flex flex-row p-5 justify-between bg-gray-950 text-white">
    <div>Kent Hack Enough</div>
    <!-- <button class="flex md:hidden" on:click={() => (toggled = !toggled)}
        >A</button
    > -->
    <div id="navbar" class="w-auto flex flex-col sm:flex-row gap-3">
        <NavbarItem href="#home">Home</NavbarItem>
        <NavbarItem href="#faq">FAQ</NavbarItem>
        <NavbarItem href="#guide">Guide</NavbarItem>
        <NavbarItem href="#sponsors">Sponsors</NavbarItem>
        <NavbarItem href="#contact">Contact</NavbarItem>
        <NavbarItem href="#schedule">Schedule</NavbarItem>
        <NavbarItem href="#profile">Profile</NavbarItem>
    </div>
</div>
