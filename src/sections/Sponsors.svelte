
<script lang="ts">
  interface Sponsor {
    name: string;
    url: string;
    image: any;
  }

  import Bawlslogo from "../assets/sponsors/bawls.png";
  import DeptLogo from "../assets/sponsors/CSLogo.png";
  import KSULogo from "../assets/sponsors/ksu-logo.svg";

  const sponsors: Sponsor[] = [
    {
      image: KSULogo,
      name: "Kent State University",
      url: "https://www.kent.edu"
    },
    {
      image: DeptLogo,
      name: "Department of Computer Science",
      url: "https://cs.kent.edu"
    },
    {
      image: Bawlslogo,
      name: "Bawls",
      url: "https://bawls.com"
    },
    
  ];
</script>

<div id="sponsors" class="flex flex-col lg:flex-row gap-4 items-center justify-center">
  {#each sponsors as { image, name, url}}
    <a class="w-96 lg:w-56" href={url} target="_blank">
      <img 
        class="w-[200px] h-[100px] object-contain transition-transform hover:scale-110" 
        src={image} 
        alt={name} 
      />
    </a>
  {/each}
</div>
