<script lang="ts">
    import Dino from "../assets/dino.svg";
    import Highlight from "../components/Highlight.svelte";
</script>

<div class="h-full flex flex-col mt-10">
    <div class="flex flex-col gap-1">
        <h1 class="text-6xl font-bold">KENT HACK ENOUGH</h1>
        <p class="text-4xl">2026</p>
    </div>
    <div class="flex flex-col gap-20 lg:flex-row">
        <img class="w-full" src={Dino} alt="Dinosaur" />
        <div class="flex flex-col text-wrap gap-10 lg:text-right justify-around">
            <p class="text-3xl">
                Kent Hack Enough is looking to the past this year, with our theme: <Highlight>Futuristic Cavemen</Highlight>. Wondering what that is? We are too! 
                Come build with us and let's find out together.
            </p>
            <p class="text-xl">
                This is our 13th KHE! Whether you're <span class="font-bold">totally new</span>
                to tech & design or a <span class="font-bold">seasoned pro</span>, come spend a
                weekend making something great with us!
            </p>
        </div>
    </div>
</div>
