<script>

    import Icon from "@iconify/svelte";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";
    import Navbar from "../../components/navbar/Navbar.svelte";

    import { authClient } from "$lib/client";
    const session = authClient.useSession();

</script>

<div class="text-white">
    <Navbar />
    <div class="p-24 h-screen flex flex-row items-center justify-center">
        <div>
            <Card>
                <div class="p-5 w-full flex flex-col gap-3">
                    <Button onclick={async () => await authClient.signIn.social({ provider: "discord" })} ><Icon icon="logos:discord-icon" />Login with Discord</Button>
                    <Button onclick={async () => await authClient.signIn.social({ provider: "github" })} ><Icon icon="logos:github-icon"/>Login with Github</Button>
                </div>
            </Card>
        </div>
    </div>
</div>
