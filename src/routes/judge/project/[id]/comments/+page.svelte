<script lang="ts">
   import { page } from "$app/stores";
   import { goto } from '$app/navigation';

   const projectId = $page.params.id;
   
   let comment = $state("");

   function handleSave() {
       // Mock Save
       console.log("Saving comments:", comment);
       goto(`/judge/project/${projectId}/submitted`);
   }
</script>

<div class="max-w-md mx-auto flex flex-col h-screen bg-sand relative">
    <!-- Header -->
    <div class="p-4 border-b border-secondary/10">
        <a href="/judge/project/{projectId}" class="text-sm text-secondary/60 hover:text-primary flex items-center gap-1">
            <span>← Back to Scoring</span>
        </a>
    </div>

    <div class="flex-1 p-6 flex flex-col">
        <h1 class="text-2xl font-bold text-secondary mb-2">Comments</h1>
        <p class="text-secondary/60 text-sm mb-6">Optional feedback for Team #{projectId}</p>

        <div class="flex-1 relative">
            <textarea
                class="w-full h-full p-4 bg-white/50 border border-secondary/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 placeholder:text-secondary/30 text-secondary"
                placeholder="Add feedback, suggestions, or mentions of what you liked..."
                bind:value={comment}
            ></textarea>
        </div>
    </div>

    <!-- Bottom Bar -->
    <div class="p-4 bg-white/80 backdrop-blur-md border-t border-secondary/10">
        <div class="flex gap-3">
             <a 
                href="/judge/project/{projectId}"
                class="flex-1 py-3 px-4 bg-transparent border border-secondary/20 text-secondary font-bold rounded-xl text-center hover:bg-secondary/5 transition-colors"
            >
                Previous
            </a>
            <button 
                onclick={handleSave}
                class="flex-[2] py-3 px-4 bg-green-700 text-white font-bold rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>Submit Score</span>
            </button>
        </div>
    </div>
</div>
