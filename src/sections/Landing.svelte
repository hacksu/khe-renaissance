
<script lang="ts">
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import { onMount } from "svelte";
    const day = "March 28-29th, 2026" 
    import Button from "../components/Button.svelte";
    import dinoSvg from "../assets/dino.svg";
    import rockImg from "../assets/rock.png";
    // const returnDate = DateTime.fromFormat("03/28/2026", "MM/dd/yyyy").toRelativeCalendar();

    let isShaking = $state(false);
    let isHovered = $state(false);
    let shakeTimeout: ReturnType<typeof setTimeout> | null = null;

    onMount(() => {
        // Shake the rock occasionally (every 5-8 seconds)
        const scheduleShake = () => {
            const delay = 5000 + Math.random() * 3000; // 5-8 seconds
            shakeTimeout = setTimeout(() => {
                isShaking = true;
                setTimeout(() => {
                    isShaking = false;
                    scheduleShake(); // Schedule next shake
                }, 500); // Shake duration
            }, delay);
        };
        scheduleShake();

        return () => {
            if (shakeTimeout) clearTimeout(shakeTimeout);
        };
    });
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center relative overflow-hidden">
    <!-- Rock overlay (matches background positioning, shakes occasionally) -->
    <img 
        src={rockImg} 
        alt="Rock" 
        class="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-100 pointer-events-none"
        class:animate-shake={isShaking}
    />
    
    <!-- Interactive Dino behind Rock -->
    <!-- Position the dino where it appears in the background scene (adjust bottom/left values to match the actual position in your scene) -->
    <div 
        class="absolute bottom-[0%] left-[18%] cursor-pointer z-[5] p-8 -m-8"
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
    >
        <!-- Dino (behind rock, pops out on hover) -->
        <img 
            src={dinoSvg} 
            alt="Dino" 
            class="w-32 md:w-48 h-auto transition-all duration-500 ease-out pointer-events-none dino-pop"
            class:dino-popped={isHovered}
        />
    </div>

    <!-- Content overlay (above rock and dino) -->
    <div class="relative z-30 flex flex-col items-center gap-3 text-center">
        <h1 class="text-4xl">Kent Hack Enough returns <span class="font-bold">{day}</span></h1>
        <div class="flex flex-col md:flex-row gap-3 w-96">
            <Button size="lg" onclick={() => goto("/auth/login")}>Apply now!</Button>
            <Button size="lg" onclick={() => goto("/schedule")}>View Schedule</Button>
        </div>
    </div>
</div>

<style>
    @keyframes shake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-5px) rotate(-2deg); }
        20% { transform: translateX(5px) rotate(2deg); }
        30% { transform: translateX(-5px) rotate(-2deg); }
        40% { transform: translateX(5px) rotate(2deg); }
        50% { transform: translateX(-3px) rotate(-1deg); }
        60% { transform: translateX(3px) rotate(1deg); }
        70% { transform: translateX(-3px) rotate(-1deg); }
        80% { transform: translateX(3px) rotate(1deg); }
        90% { transform: translateX(-2px) rotate(-0.5deg); }
    }

    .animate-shake {
        animation: shake 0.5s ease-in-out;
    }

    .dino-pop {
        transform: translateY(0) translateX(0) scale(1);
    }

    .dino-pop.dino-popped {
        transform: translateY(-60px) translateX(20px) scale(1.15);
    }
</style>
