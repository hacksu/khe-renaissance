<script>
    import Card from "../components/Card.svelte";

</script>

<div class="w-full flex flex-col lg:flex-row gap-5 justify-center items-center h-full">
    <div class="w-full lg:self-stretch">
        <Card>
            <div class="flex flex-col gap-3 p-5">
                <h1 class="font-bold text-xl">Where to go?</h1>
                <p>Kent Hack Enough is graciously hosted in the Kent State Design Innovation Hub: </p>
                <a class="text-blue-600" href="https://goo.gl/maps/gNiw3U7YgymbPA1k6" target="_blank">Design Innovation Hub, Art Bldg, Kent, OH 44243</a>
                <p>The easiest parking space to use will be the Student Center Visitor Lot, the R19 Lot or the R7 Lot directly next to Satterfield. After parking, walk towards the visitor center, and head left between the buildings. The DI Hub is located near the Honors College. </p>
            </div>
        </Card>
    </div>
    <div class="w-full h-96">
        <Card>
            <iframe class="w-full h-full" title="Map" src="https://map.concept3d.com/?id=568&amp;tbh&amp;sbh#!m/613809?lh/?ct/44418,5603" scrolling="no" frameborder="0" style="border: 0px;"></iframe>
        </Card>
    </div>
</div>
