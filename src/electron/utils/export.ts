// ----- FreeShow -----
// Export as TXT or PDF
// When exporting as PDF we create a new window and capture its content

import { isProd, toApp } from "../index"
import { join } from "path"
import { BrowserWindow, ipcMain } from "electron"
import fs from "fs"
import { MAIN, EXPORT } from "../../types/Channels"
import { exportOptions } from "./windowOptions"
import { doesPathExist } from "./files"

// ----- PDF -----

const options: any = {
  marginsType: 1,
  pageSize: "A4",
  printBackground: true,
  // printSelectionOnly: false,
  landscape: false,
}

export function generatePDF(path: string) {
  exportWindow?.webContents
    .printToPDF(options)
    .then((data: any) => {
      writeFile(path, ".pdf", data, undefined, (err: any) => {
        if (err) exportMessage(err)
        else exportWindow.webContents.send(EXPORT, { channel: "NEXT" })
      })
    })
    .catch(exportMessage)
}

function exportMessage(message: string = "") {
  toApp(MAIN, { channel: "ALERT", data: message })
  exportWindow?.close()
  exportWindow = null
}

let exportWindow: any = null
export function createPDFWindow(data: any) {
  exportWindow = new BrowserWindow(exportOptions)

  // load path
  if (isProd) exportWindow.loadFile("public/index.html")
  else exportWindow.loadURL("http://localhost:3000")

  exportWindow.webContents.on("did-finish-load", () => {
    exportWindow.webContents.send(MAIN, { channel: "OUTPUT", data: "pdf" })
    exportWindow.webContents.send(EXPORT, { channel: "PDF", data })
  })
}

ipcMain.on(EXPORT, (_e, msg: any) => {
  if (msg.channel === "DONE") return exportMessage("export.exported")
  if (msg.channel !== "EXPORT") return

  toApp(MAIN, { channel: "ALERT", data: msg.data.name })
  if (msg.data.type === "pdf") generatePDF(join(msg.data.path, msg.data.name))
})

// ----- TXT -----

export function exportTXT(data: any) {
  let msg: string = "export.exported"
  data.shows.forEach((show: any) => {
    writeFile(join(data.path, show.name), ".txt", getSlidesText(show), "utf-8", (err: any) => {
      if (err) msg = err
    })
  })
  toApp(MAIN, { channel: "ALERT", data: msg })
}

// TODO: clean this
function getSlidesText(show: any) {
  let text: string = ""

  let slides: any[] = []
  show.layouts?.[show.settings?.activeLayout].slides.forEach((layoutSlide: any) => {
    let slide = show.slides[layoutSlide.id]
    slides.push(slide)
    if (slide.children) {
      slide.children.forEach((childId: string) => {
        slides.push(show.slides[childId])
      })
    }
  })

  slides.forEach((slide) => {
    slide.items.forEach((item: any) => {
      if (item.lines) {
        item.lines.forEach((line: any) => {
          line.text.forEach((t: any) => {
            text += t.value
          })
          text += "\n"
        })
      }
      text += "\n"
    })
  })
  return text
}

// ----- HELPERS -----

function writeFile(path: string, extension: string, data: any, options: any = undefined, callback: any) {
  let number = -1
  do {
    number++
    path = path + (number ? "_" + number : "") + extension
    // console.log(path)
  } while (doesPathExist(path))

  fs.writeFile(path, data, options, callback)
}
