<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    type Option = string | { label: string; value: any };

    type Props = {
        label?: string;
        value: any;
        options: Option[];
        minChars?: number;
        maxItems?: number;
    };

    let {
        label,
        value = $bindable(),
        options,
        minChars = 0,
        maxItems = 100,
        ...others
    }: HTMLInputAttributes & Props = $props();

    let isOpen = $state(false);
    let activeIndex = $state(-1);
    let inputElement: HTMLInputElement;
    const listId = `datalist-${Math.random().toString(36).substr(2, 9)}`;

    // Input text state (separate from value for object mode)
    let text = $state("");
    
    // Normalize options to { label, value } format
    function normalize(opt: Option) {
        return typeof opt === 'string' ? { label: opt, value: opt } : opt;
    }

    // Sync text with value when value changes externally
    $effect(() => {
        if (value) {
            const found = options.find(o => {
                const n = normalize(o);
                return n.value == value;
            });
            if (found) {
                text = normalize(found).label;
            } else if (typeof value === 'string') {
                // If value not found in options but is string, assume it's custom input (e.g. school)
                text = value; 
            }
        }
    });

    let normalizedOptions = $derived(options.map(normalize));

    // Filter options based on input text
    let filteredOptions = $derived.by(() => {
        if (text.length < minChars) return [];

        const lowerText = text.toLowerCase();
        return normalizedOptions
            .filter((opt) => opt.label.toLowerCase().includes(lowerText))
            .slice(0, maxItems);
    });

    function handleInput(e: Event) {
        isOpen = true;
        activeIndex = -1;
        const isStringOptions = options.length > 0 && typeof options[0] === 'string';
        if (isStringOptions) {
            value = text;
        } else {
            const exactMatch = normalizedOptions.find(o => o.label.toLowerCase() === text.toLowerCase());
            if (exactMatch) {
                value = exactMatch.value;
            } else {
                value = undefined; // Invalid/Custom input doesn't map to a code
            }
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                isOpen = true;
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
                e.preventDefault();
                selectOption(filteredOptions[activeIndex]);
            } else if (filteredOptions.length > 0 && text) {
                 // Ignore
            }
        } else if (e.key === "Escape") {
            isOpen = false;
        } else if (e.key === "Tab") {
            // Select active if any?
            if (activeIndex >= 0) {
                selectOption(filteredOptions[activeIndex]);
            }
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

    function selectOption(option: { label: string, value: any }) {
        text = option.label;
        value = option.value;
        isOpen = false;
        activeIndex = -1;
    }

    function handleBlur() {
        setTimeout(() => {
            isOpen = false;
        }, 150);
    }

    function handleFocus() {
        isOpen = true;
    }
</script>

<div class="relative w-full">
    {#if label}
        <label for={others.id} class="text-sm">{@html label}</label>
    {/if}
    <div class="relative">
        <input
            bind:this={inputElement}
            bind:value={text}
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
                        {option.label}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>
