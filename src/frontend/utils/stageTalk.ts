import { get } from "svelte/store"
import { STAGE } from "../../types/Channels"
import type { ClientMessage } from "../../types/Socket"
import { getActiveOutputs } from "../components/helpers/output"
import { _show } from "../components/helpers/shows"
import { events, outputs, showsCache, stageShows, timers } from "../stores"
import { connections } from "./../stores"
import { send } from "./request"
import { arrayToObject, filterObjectArray, sendClientAll, sendData, timedout } from "./sendData"

export function stageListen() {
  stageShows.subscribe((data: any) => {
    data = arrayToObject(filterObjectArray(get(stageShows), ["enabled", "name", "settings", "items"], "enabled"))
    timedout(STAGE, { channel: "SHOW", data }, () => sendClientAll(STAGE, "SHOW", data, "active"))
  })
  outputs.subscribe(() => {
    sendData(STAGE, { channel: "SLIDES" }, true)
    // send(STAGE, ["OUTPUTS"], data)
  })
  showsCache.subscribe(() => {
    sendData(STAGE, { channel: "SLIDES" })
  })

  timers.subscribe(() => {
    send(STAGE, ["TIMERS"], get(timers))
  })
  events.subscribe(() => {
    send(STAGE, ["EVENTS"], get(events))
  })
}

export const receiveSTAGE: any = {
  SHOWS: (msg: ClientMessage) => {
    msg.data = turnIntoBoolean(
      filterObjectArray(get(stageShows), ["disabled", "name", "password"]).filter((a: any) => !a.disabled),
      "password"
    )
    return msg
  },
  SHOW: (msg: ClientMessage) => {
    if (msg.id) {
      let show = get(stageShows)[msg.data.id]
      if (!show.password.length || show.password === msg.data.password) {
        // connection successfull
        connections.update((a) => {
          if (!a.STAGE[msg.id!]) a.STAGE[msg.id!] = {}
          a.STAGE[msg.id!].active = msg.data.id
          return a
        })
        show = arrayToObject(filterObjectArray(get(stageShows), ["disabled", "name", "settings", "items"]))[msg.data.id]
        if (!show.disabled) {
          msg.data = show
          sendData(STAGE, { channel: "SLIDES", data: [] })

          // initial
          window.api.send(STAGE, { id: msg.id, channel: "TIMERS", data: get(timers) })
          window.api.send(STAGE, { id: msg.id, channel: "EVENTS", data: get(events) })
        } else msg = { id: msg.id, channel: "ERROR", data: "noShow" }
      } else msg = { id: msg.id, channel: "ERROR", data: "wrongPass" }
    } else msg = { id: msg.id, channel: "ERROR", data: "missingID" }
    return msg
  },
  SLIDES: (msg: ClientMessage) => {
    let currentOutput: any = get(outputs)[getActiveOutputs()[0]]
    let out: any = currentOutput?.out?.slide || null
    msg.data = []
    console.log(out)

    if (!out || out.id === "temp") return
    let ref: any[] = _show(out.id).layouts([out.layout]).ref()[0]
    let slides: any = _show(out.id).get().slides
    console.log(slides)

    if (!ref[out.index!]) return
    msg.data = [slides[ref[out.index!].id]]

    let index = out.index! + 1
    while (index < ref.length && ref[index].disabled === true) index++

    console.log(ref[index])
    if (index < ref.length && !ref[index].disabled) msg.data.push(slides[ref[index].id])
    else msg.data.push(null)

    console.log(msg.data)
    return msg
  },
  // case "SHOW":
  //   data = getStageShow(message.data)
  //   break
  // case "BACKGROUND":
  //   data = getOutBackground()
  //   break
  // case "SLIDE":
  //   data = getOutSlide()
  //   break
  // case "OVERLAYS":
  //   data = getOutOverlays()
  //   break
}

function turnIntoBoolean(array: any[], key: string) {
  return array.map((a) => {
    a[key] = a[key].length ? true : false
    return a
  })
}
