# ✨ Preview YouTube Videos and Read Comments From Any Thumbnail

<details open>
  <summary><small style="color: #666;">Hide image</small></summary>
  <img src="https://greasyfork.s3.us-east-2.amazonaws.com/ckernj5q712hpz3ruhc8fvedd8v8" alt="Image">
</details>

**Attaches ▶ preview and 💬 comment buttons to YouTube thumbnails, and plays videos inside a clean embedded popup with overlays and end-screen suggestions removed.**

---

> 🗂️ **Overview**
> This script works across two layers. On any YouTube browse page, it places small ▶ and 💬 buttons on every video thumbnail so you can preview a video or read its top comments without navigating away. When the preview player opens, it runs inside a clean embedded frame — end-screen overlays, info cards, watermarks, and Shorts-specific UI are all suppressed. Playback speed and resolution can be adjusted directly from popup controls.

## 🎛 Panel Entry Points

After installation, two buttons appear on each YouTube thumbnail when you hover over it. Two additional commands are available from your userscript manager's script menu.

| Icon | Feature Name | Where It Appears |
|------|-------------|-----------------|
| ▶ | **Video Preview** | Top-left of each thumbnail (hover to reveal) |
| 💬 | **Comments Preview** | Adjacent to the ▶ button on each thumbnail (hover to reveal) |
| ⚙️ | **Settings Panel** | Script menu → *Opening settings* |
| 🔑 | **API Key Setup** | Script menu → *Import API Key* |

Both thumbnail buttons can be set to always-visible, and their size, layout, and opacity are fully adjustable from the Settings Panel.

---

## 🚀 Core Features

### ▶ Inline Video Preview

Click the ▶ button on any thumbnail to open a floating popup player over the current page without loading a new tab or navigating away from your feed.

- **Resize**: cycle through **S / M / L / Widescreen (Fit) / MAX** by clicking the resize icon in the popup controls. The player respects a 16:9 ratio for regular videos and 9:16 for Shorts.
- **Speed control**: click the speed label to step through 0.5×, 0.75×, 1×, 1.25×, 1.5×, 1.75×, and 2×.
- **Quality control**: click the quality label to cycle through all resolutions available for that video, from 144p up to 4K where supported.
- Close with **Esc**, the ✖ button, or by clicking the dark backdrop.

---

### 💬 Comments Preview

Click the 💬 button on any thumbnail to open a comment panel for that video inline. **Requires a self-provisioned Google YouTube Data API v3 key** (see the Security section below).

- Sort by **Top** (most relevant) or **Newest**.
- Select how many comments to load per page.
- **Paginated navigation** — step forward and backward through comment pages.
- **Keyword search** — filter the currently loaded comments in real time.
- **Machine translation** — pick a target language from 50+ options to display a translated line beneath each comment. Languages you use frequently are automatically sorted to the top of the selection list.

---

## 🧪 Known Limitations & YouTube Instability Notice

YouTube's front-end is under continuous and frequent revision. Google regularly runs A/B tests, gradual rollouts, and structural changes to its player and page markup — often without public notice. Because this script works by interacting with YouTube's page structure, **any of its features may stop working at any time following a YouTube update**, regardless of the script's own version history.

Common symptoms after a YouTube-side change include: overlay elements reappearing, thumbnail buttons failing to attach, the popup player not loading, or settings controls behaving unexpectedly. These are generally **not bugs in the script itself** but a consequence of YouTube's page no longer matching the structure the script was written against.

When this happens, the author has limited ability to respond. A fix is only possible once YouTube's new page structure has stabilised enough to be reliably targeted. There is no predictable timeline for such updates. If you encounter unexpected behaviour, checking the Greasy Fork comments section to see whether others have reported the same issue is a good first step.

- Comment translation uses a public, unauthenticated translation endpoint. Availability depends on that endpoint being reachable from your region.
- **Playback performance is not a design goal of this script.** The popup player runs inside an embedded frame with additional overhead, and loading times are generally slower than opening a video directly on YouTube. This script is intended for users who prioritise staying on the current page and scanning multiple videos quickly — not for those seeking the smoothest or most responsive playback experience.

---

## ⚙️ Additional Features

Open the **Settings Panel** from the script menu to adjust all user-facing options. Most changes apply in real time while the panel is open.

**Thumbnail button appearance** — adjust icon size, font size, and background opacity; switch between horizontal and vertical button layouts; change the spacing between the two buttons; enable **Always Visible** so both buttons stay on screen permanently rather than appearing only on hover.

**Preview player appearance** — adjust the opacity of the dark backdrop behind the player; reposition the control icons vertically; change their size and opacity.

**Interface language** — switch the script's own UI text between **English**, **Traditional Chinese**, **Simplified Chinese**, **Japanese**, and **Korean**. A confirmation dialog appears before the page reloads to apply the change.

---

## 🔐 Security & Privacy Notice

> ⚠️ **The Comments feature requires a Google YouTube Data API v3 key that you obtain and manage yourself.**

| Data Type | Purpose | Storage | Transmitted To |
|---|---|---|---|
| YouTube Data API v3 Key | Authenticate requests to load video comments | Local userscript storage only | Google's official YouTube API (`googleapis.com`) |

**This script does not collect, share, or transmit your API key or any other data to any server other than Google's official API endpoint.**

> 💡 **This feature is opt-in only — no action means no risk.**
> The API key is accessed exclusively when you open the 💬 **Comments Preview** panel. Entering a key is never required for any other part of the script.
> All other features — inline video preview, player purification, speed and quality controls, the Settings Panel, and comment translation — operate completely independently and require no API key or credential of any kind.
> If you choose to use the Comments feature, note that usage of the YouTube Data API is subject to Google's standard quota limits. Reviewing the [Google YouTube Data API terms](https://developers.google.com/youtube/v3) before enabling this feature is recommended.

> 🗂️ **Unlike most Google Cloud APIs, the YouTube Data API v3 is available under a free daily quota with no billing account or credit card required.** A standard Google account is sufficient to create a project and generate an API key via [Google Cloud Console](https://console.cloud.google.com/apis/credentials). For casual personal use, the free quota is unlikely to be exhausted.

---

- This userscript is primarily maintained on Greasy Fork.
- Built with AI assistance by a hobbyist developer.
  Bug fixes and updates may not be immediate.
- Feedback is welcome. Responses may be assisted by translation tools if needed.

---