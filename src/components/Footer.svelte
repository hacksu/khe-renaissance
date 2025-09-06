<script lang="ts">
  import Logo from "../assets/hacksu.svg";
  import MLHLogo from "../assets/mlh.svg";
  import Link from "./Link.svelte";
</script>

<div
  class="bg-secondary bg-opacity-100 py-2 px-5 mt-24 flex flex-row items-center justify-between text-white"
>
  <div class="flex flex-row items-center gap-2">
    <Link href="https://hacksu.com">
      <img src={Logo} alt="HacKSU Logo" class="w-24" />
    </Link>
    <Link
      href="https://mlh.io"
      target="_blank"
      class="self-center"
    >
      <img src={MLHLogo} alt="MLH Logo" class="w-20" />
    </Link>
  </div>
  <div class="flex gap-2">
    <Link href="https://mlh.io/code-of-conduct">MLH Code of Conduct</Link>
    <Link href="https://hacksu.com">HacKSU Bylaws</Link>
  </div>
</div>
