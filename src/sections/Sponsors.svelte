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
  import BentTreeLogo from "../assets/sponsors/bent_tree_coffee_roasters_logo.png";
  import EnbasisLogo from "../assets/sponsors/enbasis_inc_logo.jpg";

  import OnePasswordLogo from "../assets/software/1password.svg";
  import BalsamiqLogo from "../assets/software/Balsamiq_2025_logo.svg";
  import BoardAndBevyLogo from "../assets/sponsors/board_and_bevy.png"

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
    {
      image: BentTreeLogo,
      name: "Bent Tree Coffee",
      url: "https://www.benttreecoffee.com",
    },
    {
      image: EnbasisLogo,
      name: "Enbasis",
      url: "https://enbasis.com",
    },
    {
      image: BoardAndBevyLogo,
      name: "Board And Bevy",
      url: "https://www.boardandbevy.com/",
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

<div id="sponsors" class="flex flex-col gap-24">
  <div class="flex flex-col gap-4">
    <h2 class="text-center text-3xl font-bold">Sponsors</h2>
    <div class="flex flex-wrap gap-8 justify-center items-center">
      {#each sponsors as { image, name, url }}
        <a class="flex justify-center items-center w-64 h-32 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" href={url} target="_blank">
          <img
            class="w-full h-full object-contain transition-transform hover:scale-110"
            src={image}
            alt={name}
          />
        </a>
      {/each}
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <h2 class="text-center text-3xl font-bold">Software License Providers</h2>
    <div class="flex flex-wrap gap-8 justify-center items-center">
      {#each softwareLicenses as { image, name, url }}
        <a class="flex justify-center items-center w-64 h-32 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" href={url} target="_blank">
          <img
            class="w-full h-full object-contain transition-transform hover:scale-110"
            src={image}
            alt={name}
          />
        </a>
      {/each}
    </div>
  </div>
</div>
