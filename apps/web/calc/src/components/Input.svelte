<script>
    export let value = 0;
    export let label = "";
    export let min = 0;
    export let max = 0;
</script>

<label>
    <span>{label}</span>
    <input type=number bind:value={value} min={min} max={max}>
</label>

<style>
    label {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        gap: 0.5rem;
        text-transform: uppercase;
        font-weight: bold;
    }
    
    input {
        font-size: 1rem;
        border: none;
        border-bottom: 1px solid rgb(220, 220, 220);
        padding: 0.5rem 1rem;
    }
</style>