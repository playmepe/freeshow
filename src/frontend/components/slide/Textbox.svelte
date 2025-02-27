<script lang="ts">
  import { onMount } from "svelte"
  import type { Item } from "../../../types/Show"
  import { currentWindow, outputs, videoExtensions } from "../../stores"
  import Image from "../drawer/media/Image.svelte"
  import { getAutoSize } from "../edit/scripts/autoSize"
  import Icon from "../helpers/Icon.svelte"
  import { getExtension } from "../helpers/media"
  import { getActiveOutputs } from "../helpers/output"
  import { loadShows } from "../helpers/setShow"
  import { _show } from "../helpers/shows"
  import Timer from "./views/Timer.svelte"

  export let item: Item
  export let ratio: number = 1
  export let smallFontSize: boolean = false
  export let ref: { type?: "show" | "stage" | "overlay" | "template"; showId?: string; slideId?: string; id: string }
  export let style: boolean = true
  export let linesStart: null | number = null
  export let linesEnd: null | number = null

  // let height: number = 0
  // let width: number = 0
  // $: autoSize = item.lines ? Math.min(height, width) / (item.lines.length + 3) : Math.min(height, width) / 2
  // TODO: get template auto size
  $: autoSize = getAutoSize(item)

  $: lines = item?.lines
  $: if (linesStart !== null && linesEnd !== null && lines?.length) lines = lines.filter((a) => a.text.filter((a) => a.value.length)?.length)

  // timer updater
  let today = new Date()
  onMount(() => {
    if (item.type !== "timer") return
    setInterval(() => (today = new Date()), 500)
  })

  $: if (item.type === "timer") ref.id = item.timer!.id!

  function getMirroredItem() {
    if (item.mirror!.show === ref.showId) return

    let outputId = getActiveOutputs($outputs)[0]
    let currentOutput = $outputs[outputId] || {}

    let currentSlideRef: any = _show(currentOutput?.out?.slide?.id || "active")
      .layouts("active")
      .ref()[0]
      .find((a: any) => a.id === ref.slideId)

    let currentSlideIndex: number = currentSlideRef.layoutIndex
    let newSlideRef: any = _show(item.mirror!.show).layouts("active").ref()[0]?.[currentSlideIndex]
    if (!newSlideRef) return
    let slideId: any = newSlideRef.id
    let newItem: any = _show(item.mirror!.show).slides([slideId]).items([0]).get()[0]?.[0]
    if (!newItem) return
    newItem.style = "width: 100%;height: 100%;"
    return newItem
  }
</script>

<!-- bind:offsetHeight={height} bind:offsetWidth={width} -->
<div class="item" style={style ? item?.style : null}>
  {#if lines}
    <div class="align" style={style ? item.align : null}>
      <div class="lines">
        {#each lines as line, i}
          {#if linesStart === null || linesEnd === null || (i >= linesStart && i < linesEnd)}
            <div class="break" class:smallFontSize style={style ? line.align : null} class:height={!line.text[0]?.value.length}>
              {#each line.text as text}
                <span style="{style ? text.style : ''}{ref.type === 'stage' || item.auto ? 'font-size: ' + autoSize + 'px;' : ''}">{@html text.value}</span>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {:else if item?.type === "media"}
    {#if item.src}
      {#if $videoExtensions.includes(getExtension(item.src))}
        <!-- video -->
        <video src={item.src} muted={true}>
          <track kind="captions" />
        </video>
      {:else}
        <Image src={item.src} alt="" style="width: 100%;height: 100%;object-fit: {item.fit || 'contain'};filter: {item.filter};{item.flipped ? 'transform: scaleX(-1);' : ''}" />
        <!-- bind:loaded bind:hover bind:duration bind:videoElem {type} {path} {name} {filter} {flipped} -->
        <!-- <MediaLoader path={item.src} /> -->
      {/if}
    {/if}
  {:else if item?.type === "timer"}
    {#key item.timer}
      <Timer {item} {ref} {today} style="font-size: {autoSize}px;" />
    {/key}
  {:else if item?.type === "mirror"}
    {#if item.mirror?.show}
      {#key item.mirror?.show}
        {#if !ref.type || ref.type === "show"}
          {#await loadShows([item.mirror.show])}
            {#if !$currentWindow}Loading...{/if}
          {:then}
            {#if ref.slideId && getMirroredItem()}
              <svelte:self item={getMirroredItem()} ref={{ showId: item.mirror.show, slideId: ref.slideId, id: ref.id }} />
            {/if}
          {/await}
        {/if}
      {/key}
    {/if}
  {:else if item?.type === "icon"}
    <Icon style="zoom: {1 / ratio};" id={item.id || ""} fill white custom />
  {/if}
</div>

<style>
  .align {
    height: 100%;
    display: flex;
    text-align: center;
    align-items: center;
  }

  .lines {
    /* overflow-wrap: break-word;
  font-size: 0; */
    width: 100%;
  }

  .break {
    width: 100%;
    /* line-height: normal; */

    font-size: 0;
    /* height: 100%; */

    overflow-wrap: break-word;
    /* line-break: after-white-space;
    -webkit-line-break: after-white-space; */
  }

  .item :global(.wj) {
    color: #ff5050;
  }

  /* span {
    display: inline;
    white-space: initial;
    color: white;
  } */

  .break :global(span) {
    font-size: 100px;
    min-height: 50px;
    /* display: inline-block; */
  }
  .break.smallFontSize :global(span) {
    font-size: 30px;
  }

  .height {
    height: 1em;
  }
</style>
