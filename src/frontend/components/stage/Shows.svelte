<script lang="ts">
  import { activeStage, stageShows } from "../../stores"
  import { history } from "../helpers/history"
  import Icon from "../helpers/Icon.svelte"
  import T from "../helpers/T.svelte"
  import Button from "../inputs/Button.svelte"
  import Center from "../system/Center.svelte"
  import StageSlide from "./StageSlide.svelte"

  function addSlide() {
    history({ id: "newStageShow", location: { page: "stage" } })
  }
</script>

<div class="main">
  {#if Object.keys($stageShows).length}
    <div class="grid">
      {#each Object.entries($stageShows) as [id, show], index}
        <StageSlide
          {id}
          {show}
          {index}
          active={$activeStage.id === id}
          on:click={(e) => {
            if (!e.ctrlKey && !e.metaKey)
              activeStage.update((as) => {
                as.id = id
                return as
              })
          }}
        />
      {/each}
    </div>
  {:else}
    <Center faded>
      <T id="empty.stage_shows" />
    </Center>
  {/if}
  <!-- Add -->
  <Button on:click={addSlide} style="width: 100%;background-color: var(--primary);" center>
    <Icon id="add" right />
    <T id="new.slide" />
  </Button>
</div>

<style>
  .main {
    flex: 1;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    overflow: auto;
    background-color: var(--primary-darker);
  }

  /* .main :global(button) {
    width: 100%;
    padding: 20px;
  } */

  .grid {
    display: flex;
    flex-wrap: wrap;
    /* gap: 10px; */
    padding: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    align-content: flex-start;
  }
</style>
