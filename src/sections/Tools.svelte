<script lang="ts">
  import OnePasswordLogo from "../assets/software/1password.svg";
  import BalsamiqLogo from "../assets/software/Balsamiq_2025_logo.svg";
  import BambuLab from "../assets/software/BambuLab.png";
  import HakkoLogo from "../assets/software/hakko.webp";
  import KeySightLogo from "../assets/software/keysight.webp";
  // import TokenCompany from "../assets/software/tokenCompany.svg";
  import MLHHardwareKit from "../assets/mlh.svg";

  interface Tool {
    name: string;
    url?: string;
    image?: any;
  }

  interface SoftwareLicense {
    name: string;
    url: string;
    image: any;
  }

  const physicalTools: Tool[] = [
    { name: "Oscilloscope",
      url: "https://www.keysight.com/us/en/home.html",
      image: KeySightLogo
    },
    { name: "Soldering Stations",
      url: "https://hakkousa.com/products/soldering/fx-888dx.html",
      image: HakkoLogo
     },
    { name: "A1 Mini",
      url: "https://bambulab.com/en-us/a1-mini",
      image: BambuLab
    },
    // { name: "Hardware Kit",
    //   url: "https://mlh.io/hardware-kit",
    //   image: MLHHardwareKit},
    // { name: "The Token Company",
  ];

  const softwareLicenses: SoftwareLicense[] = [
    {
      image: OnePasswordLogo,
      name: "1Password",
      url: "https://1password.com",
    },
    {
      name: "Balsamiq",
      url: "https://balsamiq.com",
      image: BalsamiqLogo,
    },
  ];
</script>

<div id="tools" class="flex flex-col gap-12">
  <div class="flex flex-col gap-4">
    <h2 class="text-center text-3xl font-bold">Tools & Resources</h2>
  </div>

  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-4">
      <h3 class="text-center text-2xl font-semibold">Physical Tools</h3>
      <div class="flex flex-wrap gap-4 justify-center">
        {#each physicalTools as tool}
          {#if tool.url && tool.image}
            <a href={tool.url} target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center gap-1 w-60 h-32 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <img src={tool.image} alt={tool.name} class="w-full h-16 object-contain transition-transform hover:scale-110" />
              <span class="text-sm">{tool.name}</span>
            </a>
          {:else}
            <div class="flex items-center justify-center px-6 py-4 bg-white/5 rounded-lg">
              <span class="text-lg">{tool.name}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h3 class="text-center text-2xl font-semibold">Software Licenses</h3>
      <div class="flex flex-wrap gap-8 justify-center items-center">
        {#each softwareLicenses as { image, name, url }}
          <a class="flex justify-center items-center w-60 h-32 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" href={url} target="_blank">
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
</div>
