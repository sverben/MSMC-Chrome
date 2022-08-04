import { auth as MSMCAuth } from "./msmc/index.js"

let windows = {}
const open = async (sendResponse) => {
    const auth = new MSMCAuth()
    const refresh = await chrome.storage.sync.get("refresh")
    if (refresh.refresh) {
        try {
            const xbx = await auth.refresh(refresh.refresh)
            await chrome.storage.sync.set({ refresh: xbx.save() })
            const mc = await xbx.getMinecraft()

            return sendResponse(mc.mclc())
        } catch (e) {
            console.log("Couldn't refresh, opening popup")
        }
    }

    const url = auth.createLink()
    const width = 500
    const height = 700
    const window = await chrome.windows.create({
        type: "popup",
        focused: true,
        width,
        height,
        url
    })
    windows[window.tabs[0].id] = {
        window,
        auth,
        sendResponse
    }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!windows[tabId]) return

    const { window, auth, sendResponse } = windows[tabId]
    if (!tab.url) return
    if (tab.url.startsWith(auth.token.redirect)) {
        // The user logged in
        const queryString = (new URL(tab.url)).search
        const urlParams = new URLSearchParams(queryString)
        await chrome.windows.remove(window.id)

        const code = urlParams.get("code")
        const xbx = await auth.login(code)
        await chrome.storage.sync.set({ "refresh": xbx.save() })
        const mc = await xbx.getMinecraft()
        sendResponse(mc.mclc())
    }
})
chrome.runtime.onMessageExternal.addListener(async (data, sender, sendResponse) => {
    switch (data.type) {
        case "fetch": {
            const { req } = data
            const res = await fetch(...req)
            const text = await res.text()

            sendResponse({status: res.status, text})
            break
        }
        case "version": {
            sendResponse("1.0.0")
            break
        }
        case "login": {
            await open(sendResponse)
            break
        }
    }
})