<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import Card from "../components/Card.svelte";
    import Button from "../components/Button.svelte";
    import Meteor from "../assets/castle/gargoyle.svg";
    
    type Props = {
        error?: Error & { status?: number; message?: string };
        status?: number;
    };
    
    const { error, status }: Props = $props();
    
    const errorMessages: Record<number, { title: string; message: string }> = {
        404: {
            title: "Page Not Found",
            message: "The drawbridge is up and the gate is sealed. This page doesn't exist in the kingdom. Check your scroll, brave adventurer, and try a different path!"
        },
        500: {
            title: "Something Went Wrong",
            message: "The castle walls have crumbled! Something broke on our end. Our knights are working hard to restore order. Try refreshing the page or return shortly!"
        },
        401: {
            title: "Unauthorized",
            message: "Only sworn members of the kingdom may enter here. Present your credentials at the login gate to proceed!"
        },
        403: {
            title: "Access Denied",
            message: "The portcullis is down. You don't have permission to enter this part of the castle. If you think this is a mistake, summon a HacKSU organizer!"
        }
    };
    
    const errorCode = status || error?.status || 500;
    const errorInfo = errorMessages[errorCode] || {
        title: "Oops!",
        message: "Something unexpected happened. Don't worry though - we're on it! Try refreshing the page or navigating back home."
    };
    
    // Log error code to console for debugging
    console.error(`Error ${errorCode}:`, error);
</script>

<div class="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center py-24">
    <div class="max-w-2xl w-full fade-in">
        <Card padded>
            <div class="flex flex-col items-center text-center gap-6">
                <!-- Error Title -->
                <div class="flex flex-col items-center gap-2">
                    <h1 class="text-5xl font-bold text-white">
                        {errorInfo.title}
                    </h1>
                </div>
                
                <!-- Shield Illustration -->
                <div class="my-4">
                    <img
                        src={Meteor}
                        alt="Broken shield"
                        class="w-32 md:w-48 h-auto -scale-x-100 transition-transform hover:rotate-[20deg] opacity-60"
                    />
                </div>
                
                <!-- Error Message -->
                <p class="text-lg text-castle-stoneHighlight leading-relaxed max-w-lg">
                    {errorInfo.message}
                </p>
                
                <!-- Action Buttons -->
                <div class="flex flex-col md:flex-row gap-3 w-full max-w-md mt-4">
                    <Button size="lg" onclick={() => goto("/")}>
                        Go Home
                    </Button>
                    {#if errorCode === 401 || errorCode === 403}
                        <Button size="lg" onclick={() => goto("/auth/login")}>
                            Login
                        </Button>
                    {:else}
                        <Button size="lg" onclick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    {/if}
                </div>
                
                <!-- Additional Help -->
                <div class="mt-8 pt-6 border-t border-white/20 w-full">
                    <p class="text-sm text-castle-stoneHighlight opacity-80">
                        Need help? Check out our <a href="/#faq" class="text-castle-torchAmber hover:text-castle-torchYellow underline underline-offset-2">FAQ</a> or 
                        <a href="https://hacksu.com" target="_blank" class="text-castle-torchAmber hover:text-castle-torchYellow underline underline-offset-2">contact HacKSU</a>.
                    </p>
                </div>
            </div>
        </Card>
    </div>
</div>

<style>
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeInUp 0.6s ease-out both;
    }
</style>
