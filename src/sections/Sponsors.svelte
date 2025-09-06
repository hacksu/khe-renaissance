<script lang="ts">
  interface Sponsor {
    name: string;
    url: string;
    image: any;
  }

  interface SoftwareLisence {
    name: string;
    url: string;
    image: any;
  }

  import Bawlslogo from "../assets/sponsors/bawls.png";
  import DeptLogo from "../assets/sponsors/CSLogo.png";
  import KSULogo from "../assets/sponsors/ksu-logo.svg";

  import OnePasswordLogo from "../assets/software/1password.svg";
  import BalsamiqLogo from "../assets/software/balsamiq.webp";

  const sponsors: Sponsor[] = [
    {
      image: KSULogo,
      name: "Kent State University",
      url: "https://www.kent.edu",
    },
    {
      image: DeptLogo,
      name: "Department of Computer Science",
      url: "https://cs.kent.edu",
    },
    {
      image: Bawlslogo,
      name: "Bawls",
      url: "https://bawls.com",
    },
  ];

  const softwareLicenses: SoftwareLisence[] = [
    {
      image: OnePasswordLogo,
      name: "1password",
      url: "https://1password.com",
    },
    {
      name: "Balsamiq",
      url: "https://balsamiq.com",
      image: BalsamiqLogo,
    },
  ];
</script>

<div class="flex flex-col gap-24">
  <div class="flex flex-col gap-4">
    <h2 class="text-center text-3xl font-bold">Sponsors</h2>
    <div id="sponsors" class="flex flex-col lg:flex-row gap-4 justify-center items-center ">
      {#each sponsors as { image, name, url }}
        <a class="flex justify-center items-center w-96 lg:w-56" href={url} target="_blank">
          <img
            class="w-[200px] h-[100px] object-contain transition-transform hover:scale-110"
            src={image}
            alt={name}
          />
        </a>
      {/each}
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <h2 class="text-center text-3xl font-bold">Software License Providers</h2>
    <div class="flex flex-col lg:flex-row gap-4 justify-center items-center ">
      {#each softwareLicenses as { image, name, url }}
        <a class="flex justify-center items-center w-96 lg:w-56" href={url} target="_blank">
          <img
            class="w-[200px] h-[100px] object-contain transition-transform hover:scale-110"
            src={image}
            alt={name}
          />
        </a>
      {/each}
    </div>
  </div>
</div>
