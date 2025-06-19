
<script lang="ts">
  interface Sponsor {
    name: string;
    url: string;
    image: any;
  }

  import BawlsLogo from "../assets/sponsors/bawls.webp";
  import KSULogo from "../assets/sponsors/ksu-logo.svg";
  import DepartLogo from "../assets/sponsors/department.png";

  const sponsors: Sponsor[] = [
    {
      image: KSULogo,
      name: "Kent State University",
      url: "https://cs.kent.edu"
    },
    {
      image: DepartLogo,
      name: "Department of Computer Science",
      url: "https://cs.kent.edu"
    },
    {
      image: BawlsLogo,
      name: "Enbasis",
      url: "https://enbasis.com"
    }
  ];
</script>

<div id="sponsors" class="flex flex-col lg:flex-row gap-4 items-center justify-center">
    {#each sponsors as { image, name, url}}
        <a class="w-96 lg:w-56" href={url} target="_blank">
            <img
                class="rounded-lg w-[300px] h-[100px] object-contain transition-transform hover:scale-105"
                src={image}
                alt={name}
            />
        </a>
    {/each}
</div>
