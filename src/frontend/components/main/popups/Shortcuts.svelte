<script>
  import T from "../../helpers/T.svelte"

  const shortcuts = {
    // arrow keys!
    // space
    // tabs
    // "menu.show": "1",
    // "menu.edit": "2",
    // "menu.stage": "3",
    // "menu.draw": "4",
    // "menu.calendar": "5",
    // "menu.settings": "6",
    // "tabs.shows": "ctrl + 1",
    // "tabs.media": "ctrl + 2",
    // "tabs.overlays": "ctrl + 3",
    // "tabs.templates": "ctrl + 4",
    // "tabs.audio": "ctrl + 5",
    // "tabs.scripture": "ctrl + 6",
    // "tabs.player": "ctrl + 7",
    // "tabs.live": "ctrl + 8",
    "actions.change_tab": "num",
    "actions.change_drawer_tab": "ctrl + num",
    // "Toggle drawer": "esc",
    ctrl: "SEPERATOR",
    "actions.selectAll": "ctrl + a",
    "actions.copy": "ctrl + c",
    "actions.duplicate": "ctrl + d",
    "actions.export": "ctrl + e",
    "actions.fullscreen_preview": "ctrl + f",
    "actions.import": "ctrl + i",
    "preview._lock": "ctrl + l",
    "actions.mute": "ctrl + m",
    "new.show": "ctrl + n",
    "actions.toggle_output": "ctrl + o",
    // "new.project": "ctrl + p",
    "preview._update": "ctrl + r",
    "actions.save": "ctrl + s",
    "actions.paste": "ctrl + v",
    "actions.cut": "ctrl + x",
    "actions.redo": "ctrl + y",
    "actions.undo": "ctrl + z",
    f: "SEPERATOR",
    "clear.all": "esc",
    // "clear.all": ".",
    "clear.background": "f1",
    "clear.slide": "f2",
    "clear.overlays": "f3",
    "clear.audio": "f4",
    // "clear.nextTimer": "f5",
    // "from start": "f5",
    // MAC: cmd + shift + f
    "actions.fullscreen": "f11",
    // presenterKeys: "SEPERATOR",
  }
</script>

<main>
  {#each Object.entries(shortcuts) as [id, shortcut]}
    {#if shortcut === "SEPERATOR"}
      <hr />
    {:else}
      <div>
        <p><T {id} /></p>
        <span class="shortcut">{shortcut}</span>
      </div>
    {/if}
  {/each}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  main div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  p {
    font-weight: bold;
  }

  hr {
    height: 3px;
    border: none;
    margin: 10px 0;
    background-color: var(--primary-lighter);
  }

  .shortcut {
    background-color: var(--primary-darker);
    padding: 5px 10px;
    text-transform: uppercase;
    border: 3px solid var(--primary-lighter);
    min-width: 120px;
    text-align: center;
  }
</style>
