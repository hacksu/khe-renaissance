<script lang="ts">
  import Logo from "../assets/hacksu.svg";
  import MLHLogo from "../assets/mlh.svg";
  import Link from "./Link.svelte";
</script>

<div class="bg-secondary bg-opacity-100 py-2 px-5 mt-24 flex flex-row items-center text-white">
  <div class="flex flex-row items-center">
    <p class="font-bold text-2xl tracking-wide">POWERED BY:</p>
    <Link href="https://hacksu.com">
      <img
        src={Logo}
        alt="HacKSU Logo"
        class="w-24"
      />
    </Link>
  </div>
  <div class="flex-1"></div>
  <p class="font-bold text-2xl tracking-wide px-4">Code of Conduct:</p>
  <Link href="https://mlh.io/code-of-conduct" target="_blank" class="self-center">
    <img
      src={MLHLogo}
      alt="MLH Logo"
      class="w-20"
    />
  </Link>
</div>
