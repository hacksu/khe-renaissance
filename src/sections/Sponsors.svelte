<script lang="ts">
  interface Sponsor {
    name: string;
    url: string;
    image: any;
  }

  import Bawlslogo from "../assets/sponsors/bawls.png";
  import DeptLogo from "../assets/sponsors/CSLogo.png";
  import KSULogo from "../assets/sponsors/ksu-logo.svg";
  import BentTreeLogo from "../assets/sponsors/bent_tree_coffee_roasters_logo.png";
  import BarrioLogo from "../assets/sponsors/barrio_logo.webp";
  import EnbasisLogo from "../assets/sponsors/enbasis_inc_logo.jpg";
  import HacKSULogo from "../assets/sponsors/hacksu_logo.svg";
  import PureButtonsLogo from "../assets/sponsors/pure_buttons_logo.png"
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
      url: "https://www.kent.edu/cs",
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
        image: BarrioLogo,
        name: "Barrio Mexican Kitchen and Bar"
        url: "https://barrio-tacos.com/locations/kent/"
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
    {
        image: PureButtonsLogo,
        name: "Pure Buttons",
        url: "https://mail.mlh.io/e/c/eyJlIjoxNTI0ODIsImVtYWlsX2lkIjoiZXhhbXBsZSIsImhyZWYiOiJodHRwczovL21saC5saW5rL01MSC1QdXJlQnV0dG9ucy1oYWNrYXRob25zP2Fqc191aWQ9MDE5NjNjZjEtNmZlNy00NmU1LThiOWItOWYzYjQ1ZTQ5YTQxXHUwMDI2dXRtX2NhbXBhaWduPU1lbWJlcitFdmVudCstK1B1cmUrQnV0dG9ucytJbnRyb1x1MDAyNnV0bV9jb250ZW50PVB1cmUrQnV0dG9ucytJbnRyb1x1MDAyNnV0bV9tZWRpdW09RW1haWxcdTAwMjZ1dG1fc291cmNlPUN1c3RvbWVyLmlvIiwidCI6MTc0NDgwNzUxMX0/465b97fffd84c977c1b3f1e4dc23b3c937dce616e1a19b195fbefe37581efec1",

    },
    {
      image: HacKSULogo,
      name: "HacKSU",
      url: "https://hacksu.com",
    },
    {
      image: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
      name: "Amazon Web Services",
      url: "https://aws.amazon.com",
    },
  ];
</script>

<div id="sponsors" class="flex flex-col gap-4">
  <h2 class="text-center text-3xl font-bold">Sponsors</h2>
  <div class="flex flex-wrap gap-8 justify-center items-center">
    {#each sponsors as { image, name, url }}
      <a class="flex justify-center items-center w-72 h-36 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" href={url} target="_blank">
        <img
          class="w-full h-full object-contain transition-transform hover:scale-110"
          src={image}
          alt={name}
        />
      </a>
    {/each}
  </div>
</div>
