<template>
    <div>
        <p class="quote">
            <slot />
        </p>
        <p class="author">{{ author }}</p>
    </div>
</template>

<script>
export default {
    props: ['author'],
}
</script>

<style lang="stylus" scoped>
.quote
	font-style: italic

.author
	text-align: right
</style>
