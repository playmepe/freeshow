<script lang="ts">
  import { outputs, showsCache } from "../../../stores"
  import { getActiveOutputs } from "../../helpers/output"
  import { _show } from "../../helpers/shows"

  export let next: boolean = false

  $: currentSlide = $outputs[getActiveOutputs()[0]].out?.slide
  $: index = currentSlide && currentSlide.index !== undefined ? currentSlide.index + (next ? 1 : 0) : null
  $: slideId = index !== null && currentSlide ? _show("active").layouts("active").ref()[0][index!]?.id || null : null
  $: slide = currentSlide && slideId ? $showsCache[currentSlide.id].slides[slideId] : null
</script>

{#if slide}
  <div>
    {slide.notes}
  </div>
{/if}

<style>
  div {
    font-size: 100px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
