<script>
    import Link from "$components/Link.svelte";
</script>

<div id="map" class="flex flex-col gap-12">

    <!-- Section heading -->
    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">The Kingdom's Location</p>
        <h2 class="text-5xl font-black text-castle-gold" style="text-shadow: 0 0 30px rgba(201,168,76,0.4);">
            Find the Castle
        </h2>
        <p class="text-castle-stoneHighlight text-sm max-w-md">
            The gates open at the Design Innovation Hub. Navigate to us and join the siege.
        </p>
    </div>

    <!-- Map + directions layout -->
    <div class="map-grid">

        <!-- Directions panel -->
        <div class="directions-panel">
            <div class="panel-header">
                <span class="panel-title">Royal Directions</span>
            </div>

            <div class="directions-body">
                <div class="destination-block">
                    <p class="destination-label">Destination</p>
                    <Link href="https://goo.gl/maps/gNiw3U7YgymbPA1k6">
                        Design Innovation Hub<br/>Art Bldg, Kent, OH 44243
                    </Link>
                </div>

                <div class="divider"></div>

                <div class="directions-list">
                    <div class="direction-item">
                        <p class="text-castle-stoneHighlight text-sm leading-relaxed">
                            Best parking: <span class="text-white font-semibold">Student Center Visitor Lot</span>,
                            R19 Lot, or R7 Lot next to Satterfield.
                        </p>
                    </div>
                    <div class="direction-item">
                        <p class="text-castle-stoneHighlight text-sm leading-relaxed">
                            Walk toward the visitor center, then head <span class="text-white font-semibold">left between the buildings</span>.
                        </p>
                    </div>
                    <div class="direction-item">
                        <p class="text-castle-stoneHighlight text-sm leading-relaxed">
                            The DI Hub is located near the <span class="text-white font-semibold">Honors College</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Map embed -->
        <div class="map-frame-wrap">
            <iframe
                class="w-full h-full rounded-lg"
                title="Map to Design Innovation Hub"
                src="https://map.concept3d.com/?id=568&tbh&sbh#!m/613809?lh/?ct/44418,5603"
                scrolling="no"
                frameborder="0"
                style="border: 0px;"
            ></iframe>
            <div class="map-border-glow"></div>
        </div>
    </div>
</div>

<style>
    .eyebrow {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.5em; font-weight: 600; color: #ffb347;
    }

    .map-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    @media (min-width: 1024px) {
        .map-grid {
            grid-template-columns: 360px 1fr;
            align-items: stretch;
        }
    }

    .directions-panel {
        display: flex;
        flex-direction: column;
        background: linear-gradient(160deg, #3a3a4e 0%, #2a2a38 100%);
        border: 1px solid rgba(201,168,76,0.25);
        border-radius: 0.75rem;
        overflow: hidden;
    }

    .panel-header {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.875rem 1.25rem;
        background: linear-gradient(90deg, rgba(201,168,76,0.12), transparent);
        border-bottom: 1px solid rgba(201,168,76,0.18);
    }

    .panel-title {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.35em;
        font-weight: 700;
        color: rgba(201,168,76,0.7);
    }

    .directions-body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
    }

    .destination-block { display: flex; flex-direction: column; gap: 0.25rem; }

    .destination-label {
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        color: rgba(201,168,76,0.5);
        font-weight: 700;
    }

    .divider {
        height: 1px;
        background: linear-gradient(90deg, rgba(201,168,76,0.2), transparent);
    }

    .directions-list { display: flex; flex-direction: column; gap: 1rem; }

    .direction-item {
        padding-left: 0.25rem;
        border-left: 2px solid rgba(201,168,76,0.25);
    }

    .map-frame-wrap {
        position: relative;
        min-height: 360px;
        border-radius: 0.75rem;
        overflow: hidden;
        border: 1px solid rgba(201,168,76,0.2);
    }

    .map-border-glow {
        position: absolute;
        inset: 0;
        border-radius: 0.75rem;
        pointer-events: none;
        box-shadow: inset 0 0 40px rgba(0,0,0,0.4);
    }
</style>
