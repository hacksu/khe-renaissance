
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
                }, 800); // Shake duration
            }, delay);
        };
        scheduleShake();

        return () => {
            if (shakeTimeout) clearTimeout(shakeTimeout);
        };
    });
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center relative overflow-hidden">
    <img 
        src={rockImg} 
        alt="Rock" 
        class="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-100 pointer-events-none overflow-hidden"
        class:animate-shake={isShaking}
        style="transform-origin: center center;"
    />
    
    <div 
        class="absolute bottom-[0%] left-[18%] cursor-pointer z-[5] p-8 -m-8"
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
    >
        <img 
            src={dinoSvg} 
            alt="Dino" 
            class="w-32 md:w-48 h-auto transition-all duration-500 ease-out pointer-events-none dino-pop"
            class:dino-popped={isHovered}
            class:dino-hidden={!isHovered}
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

<!--I hate keyframes -->
<style>
    @keyframes shake {
        0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
        5% { 
            transform: translate(-3px, -2px) rotate(-1deg) scale(1.002);
        }
        10% { 
            transform: translate(3px, 2px) rotate(1deg) scale(1.001);
        }
        15% { 
            transform: translate(-2px, 1px) rotate(-0.8deg) scale(1.001);
        }
        20% { 
            transform: translate(2px, -1px) rotate(0.8deg) scale(1);
        }
        25% { 
            transform: translate(-2px, 2px) rotate(-0.6deg) scale(1.001);
        }
        30% { 
            transform: translate(2px, -2px) rotate(0.6deg) scale(1);
        }
        35% { 
            transform: translate(-1px, 1px) rotate(-0.4deg) scale(1);
        }
        40% { 
            transform: translate(1px, -1px) rotate(0.4deg) scale(1);
        }
        45% { 
            transform: translate(-1px, 0px) rotate(-0.3deg) scale(1);
        }
        50% { 
            transform: translate(1px, 1px) rotate(0.3deg) scale(1);
        }
        55% { 
            transform: translate(-0.5px, -0.5px) rotate(-0.2deg) scale(1);
        }
        60% { 
            transform: translate(0.5px, 0.5px) rotate(0.2deg) scale(1);
        }
        65% { 
            transform: translate(-0.5px, 0px) rotate(-0.1deg) scale(1);
        }
        70% { 
            transform: translate(0.5px, 0px) rotate(0.1deg) scale(1);
        }
        75% { 
            transform: translate(-0.3px, 0px) rotate(-0.05deg) scale(1);
        }
        80% { 
            transform: translate(0.3px, 0px) rotate(0.05deg) scale(1);
        }
        85% { 
            transform: translate(-0.2px, 0px) rotate(-0.03deg) scale(1);
        }
        90% { 
            transform: translate(0.2px, 0px) rotate(0.03deg) scale(1);
        }
        95% { 
            transform: translate(-0.1px, 0px) rotate(-0.01deg) scale(1);
        }
        100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
    }

    .animate-shake {
        animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        transform-origin: center center;
    }

    .dino-pop {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
        visibility: hidden;
    }

    .dino-pop.dino-popped {
        transform: translateY(-60px) translateX(20px) scale(1.15);
        opacity: 1;
        visibility: visible;
    }

    .dino-pop.dino-hidden {
        opacity: 0;
        visibility: hidden;
    }
</style>
