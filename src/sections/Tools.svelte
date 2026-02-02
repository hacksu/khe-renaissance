<script lang="ts">
  import OnePasswordLogo from "../assets/software/1password.svg";
  import BalsamiqLogo from "../assets/software/Balsamiq_2025_logo.svg";

  interface Tool {
    name: string;
    quantity?: number;
  }

  interface SoftwareLicense {
    name: string;
    url: string;
    image: any;
  }

  const physicalTools: Tool[] = [
    { name: "Oscilloscope" },
    { name: "Soldering Stations" },
    { name: "Bambu Lab A1 Mini", quantity: 2 },
    // { name: "MLH Hardware Kit" },
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
    <p class="text-center text-gray-400">Hardware and software available for use during the hackathon</p>
  </div>

  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-4">
      <h3 class="text-center text-2xl font-semibold">Physical Tools</h3>
      <div class="flex flex-wrap gap-4 justify-center">
        {#each physicalTools as tool}
          <div class="flex items-center justify-center px-6 py-4 bg-white/5 rounded-lg">
            <span class="text-lg">
              {tool.name}{#if tool.quantity} <span class="text-gray-400">(x{tool.quantity})</span>{/if}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h3 class="text-center text-2xl font-semibold">Software Licenses</h3>
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
</div>
