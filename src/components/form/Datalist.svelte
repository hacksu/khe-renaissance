<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    type Props = {
        label?: string;
        value: string;
        options: string[];
        minChars?: number;
        maxItems?: number;
    };

    let {
        label,
        value = $bindable(),
        options,
        minChars = 2,
        maxItems = 100,
        ...others
    }: HTMLInputAttributes & Props = $props();

    let isOpen = $state(false);
    let activeIndex = $state(-1);
    let inputElement: HTMLInputElement;
    const listId = `datalist-${Math.random().toString(36).substr(2, 9)}`;

    // Filter options based on input value
    let filteredOptions = $derived.by(() => {
        if (value.length < minChars) return [];

        const lowerValue = value.toLowerCase();
        return options
            .filter((opt) => opt.toLowerCase().includes(lowerValue))
            .slice(0, maxItems);
    });

    function handleInput() {
        isOpen = true;
        activeIndex = -1;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                if (value.length >= minChars) {
                    isOpen = true;
                }
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, filteredOptions.length - 1);
            scrollToActive();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, -1);
            scrollToActive();
        } else if (e.key === "Enter") {
            if (activeIndex >= 0) {
                e.preventDefault(); // Prevent form submission if selecting
                selectOption(filteredOptions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            isOpen = false;
        } else if (e.key === "Tab") {
            isOpen = false;
        }
    }

    function scrollToActive() {
        const list = document.getElementById(listId);
        if (list && activeIndex >= 0) {
            const item = list.children[activeIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    function selectOption(option: string) {
        value = option;
        isOpen = false;
        activeIndex = -1;
    }

    function handleBlur() {
        // Small delay to allow click events to process
        setTimeout(() => {
            isOpen = false;
        }, 150);
    }

    function handleFocus() {
        if (value.length >= minChars) {
            isOpen = true;
        }
    }
</script>

<div class="relative w-full">
    {#if label}
        <label for={others.id} class="text-sm">{@html label}</label>
    {/if}
    <div class="relative">
        <input
            bind:this={inputElement}
            bind:value
            type="text"
            autocomplete="off"
            {...others}
            class="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            oninput={handleInput}
            onkeydown={handleKeydown}
            onblur={handleBlur}
            onfocus={handleFocus}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={isOpen}
        />

        {#if isOpen && filteredOptions.length > 0}
            <ul
                id={listId}
                class="text-black absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
            >
                {#each filteredOptions as option, i}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <li
                        role="option"
                        aria-selected={i === activeIndex}
                        class="cursor-pointer px-4 py-2 hover:bg-blue-100 {i === activeIndex ? 'bg-blue-100' : ''}"
                        onclick={() => selectOption(option)}
                        onmouseenter={() => activeIndex = i}
                    >
                        {option}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>
