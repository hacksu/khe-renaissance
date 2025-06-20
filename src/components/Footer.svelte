<script lang="ts">
  import Logo from "../assets/hacksu.svg";
  import MLHLogo from "../assets/mlh.svg";
  import Link from "./Link.svelte";
</script>

<div class="bg-secondary py-2 px-10 mt-24 flex flex-row items-center text-white gap-4">
  <Link href="https://hacksu.com">
    <img
      src={Logo}
      alt="HacKSU Logo"
      class="w-24"
    />
  </Link>
  <Link href="https://mlh.io" target="_blank" class="self-center">
    <img
      src={MLHLogo}
      alt="MLH Logo"
      class="w-20"
    />
  </Link>
</div>
