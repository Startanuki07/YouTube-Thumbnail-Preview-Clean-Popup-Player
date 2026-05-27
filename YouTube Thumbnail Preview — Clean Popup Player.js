// ==UserScript==
// @name         YouTube Thumbnail Preview — Clean Popup Player
// @name:zh-TW   YouTube 縮圖預覽 — 淨化彈窗播放器
// @name:zh-CN   YouTube 缩略图预览 — 净化弹窗播放器
// @name:ja      YouTube サムネイルプレビュー — クリーンポップアッププレイヤー
// @name:ko      YouTube 썸네일 미리보기 — 클린 팝업 플레이어
// @name:es      YouTube Vista Previa de Miniatura — Reproductor Emergente Limpio
// @name:pt-BR   YouTube Pré-visualização de Miniatura — Reprodutor Popup Limpo
// @name:fr      YouTube Aperçu des Miniatures — Lecteur Popup Épuré
// @namespace    https://greasyfork.org/en/users/1575945-star-tanuki07
// @homepageURL  https://github.com/Startanuki07
// @version      1.5.0.2
// @license      MIT
// @author       Star_tanuki07
// @icon         https://www.youtube.com/s/desktop/3748dff5/img/favicon_48.png
// @match        https://www.youtube.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      youtube.com
// @connect      googleapis.com
// @connect      translate.googleapis.com
// @description        Adds ▶ preview and 💬 comment buttons to YouTube thumbnails; opens a clean, overlay-free popup player. Comments require a YouTube Data API key.
// @description:zh-TW  為 YouTube 縮圖新增 ▶ 預覽與 💬 留言按鈕，以淨化彈窗播放器播放影片（移除疊加層）。留言功能需自行申請 YouTube Data API 金鑰。
// @description:zh-CN  为 YouTube 缩略图添加 ▶ 预览和 💬 评论按钮，以净化弹窗播放器播放（移除叠加层）。评论功能需自行申请 YouTube Data API 密钥。
// @description:ja     YouTubeサムネイルに ▶ プレビューと 💬 コメントボタンを追加し、オーバーレイを除去したクリーンなポップアップで再生。コメント機能にはYouTube Data APIキーが必要。
// @description:ko     YouTube 썸네일에 ▶ 미리보기·💬 댓글 버튼을 추가하고 오버레이를 제거한 클린 팝업 플레이어로 재생합니다. 댓글 기능은 YouTube Data API 키가 필요합니다.
// @description:es     Agrega botones ▶ de vista previa y 💬 de comentarios a las miniaturas de YouTube; abre un reproductor emergente limpio sin superposiciones. Los comentarios requieren una clave API de YouTube Data.
// @description:pt-BR  Adiciona botões ▶ de pré-visualização e 💬 de comentários às miniaturas do YouTube; abre um reprodutor popup limpo sem sobreposições. Comentários requerem uma chave API do YouTube Data.
// @description:fr     Ajoute des boutons ▶ de prévisualisation et 💬 de commentaires aux miniatures YouTube ; ouvre un lecteur popup épuré sans superpositions. Les commentaires nécessitent une clé API YouTube Data.
// ==/UserScript==

(function () {
  "use strict";

  const CleanupManager = {
    observers: [],
    timers: [],
    listeners: [],

    addObserver(observer) {
      this.observers.push(observer);
    },

    addTimer(timerId) {
      this.timers.push(timerId);
    },

    addListener(element, event, handler, options) {
      this.listeners.push({ element, event, handler, options });
      element.addEventListener(event, handler, options);
    },

    removeListener(element, event, handler) {
      const idx = this.listeners.findIndex(
        (e) => e.element === element && e.event === event && e.handler === handler
      );
      if (idx !== -1) this.listeners.splice(idx, 1);
      element.removeEventListener(event, handler);
    },

    cleanup() {
      this.observers.forEach(obs => obs.disconnect());
      this.timers.forEach(id => clearInterval(id));
      this.listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.observers = [];
      this.timers = [];
      this.listeners = [];
    }
  };

  window.addEventListener('beforeunload', () => CleanupManager.cleanup());

  if (window.self !== window.top) {
    const ID = "embedded-youtube-fix";

    const style = document.createElement("style");
    style.textContent = `
    #masthead-container, ytd-masthead, #secondary, #related, #comments,
    ytd-comments, #below, ytd-watch-metadata, ytd-playlist-panel-renderer, #chat-container,
    tp-yt-paper-toast, yt-notification-action-renderer, yt-confirm-dialog-renderer,
    ytd-single-option-survey-renderer, ytd-upsell-dialog-renderer,
    ytd-mealbar-promo-renderer, ytd-enforcement-message-view-model,
    #splash-screen, ytd-watch-skeleton, .watch-skeleton, #skeleton,
    .ytp-cards-button, .ytp-cards-teaser, .ytp-cards-button-icon,
    button[aria-label*="カード"], button[aria-label*="Card"],
    .yt-spec-button-shape-next--overlay,
    .ytp-pause-overlay, .ytp-watermark { display: none !important; }
    .html5-video-player { overflow: visible !important; }
    #ytd-player { overflow: visible !important; }
    video[style*="top: -"] { top: -9999px !important; }
    .ytp-settings-menu { max-height: 260px !important; overflow-y: auto !important; bottom: 60px !important; z-index: 2147483647 !important; position: absolute !important; pointer-events: auto !important; }
    .ytp-settings-button { pointer-events: auto !important; z-index: 2147483647 !important; }
    .ytp-unmute { display: none !important; }
    ytd-app, body, html { background: #000 !important; overflow: hidden !important; }
    #page-manager, #columns, #primary, ytd-watch-flexy, #player-container-outer, #player-container-inner { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
    .html5-video-player { width: 100vw !important; height: 100vh !important; }
    ytd-reel-video-renderer #overlay, ytd-reel-player-overlay-renderer, ytd-reel-player-header-renderer, ytd-shorts-player-controls, ytd-reel-player-endpoint, #shorts-player-controls, ytd-shorts .ytd-reel-player-overlay-renderer, ytd-reel-video-renderer .overlay, #reel-player-overlay-renderer, .ytd-reel-player-overlay-renderer, ytd-shorts-bottom-action-bar-renderer { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }
    `;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      const rootObserver = new MutationObserver(() => {
        if (document.head) { document.head.appendChild(style); rootObserver.disconnect(); }
      });
      rootObserver.observe(document.documentElement, { childList: true });
    }

    ["mousedown", "mouseup", "mousemove", "wheel", "keydown", "touchstart"].forEach(evt => {
      window.addEventListener(evt, () => {
        try { window.parent.postMessage("__YT_USER_ACTIVE__", "*"); } catch (_) {}
      }, { passive: true });
    });

    window.addEventListener("message", (e) => {
      if (e.data === ID) {
        e.stopImmediatePropagation();
        if (document.querySelector(".ytp-error")) e.source?.postMessage(ID, e.origin);
        return;
      }
      try {
        const data = JSON.parse(e.data);
        const video = document.querySelector("video");
        const player = document.getElementById("movie_player");
        if (data.type === "SET_SPEED" && video) video.playbackRate = data.value;
        if (data.type === "GET_QUALITY" && player?.getAvailableQualityLevels) {
          window.parent.postMessage(JSON.stringify({ type: "QUALITY_LIST", levels: player.getAvailableQualityLevels(), current: player.getPlaybackQuality() }), "*");
        }
        if (data.type === "SET_QUALITY" && player) {
          if (data.value === "auto" || data.value === "default") {
            const levels = player.getAvailableQualityLevels ? player.getAvailableQualityLevels() : [];
            let target = "default";

            if (levels.includes("hd1080")) {
              target = "hd1080";
            } else if (levels.includes("hd720")) {
              target = "hd720";
            } else if (levels.length > 0) {
              target = levels.find(l => l !== "auto" && l !== "highres") || "default";
            }

            if (target !== "default") {
              if (player.setPlaybackQualityRange) player.setPlaybackQualityRange(target, target);
              if (player.setPlaybackQuality) player.setPlaybackQuality(target);
            } else {
              if (player.setPlaybackQuality) player.setPlaybackQuality("default");
            }
          } else {
            if (player.setPlaybackQualityRange) player.setPlaybackQualityRange(data.value, data.value);
            if (player.setPlaybackQuality) player.setPlaybackQuality(data.value);
          }
        }
      } catch (err) {}
    });

    const _unmuteVideo = () => {
      const v = document.querySelector("video");
      if (v) { v.muted = false; }
      const player = document.getElementById("movie_player");
      if (player && player.unMute) { player.unMute(); }
    };

    const _notifyCanPlay = () => {
      setTimeout(() => {
        try { window.parent.postMessage("__YT_CANPLAY__", "*"); } catch (_) {}
      }, 150);
    };

    window.addEventListener("message", (ev) => {
      if (ev.data === "__YT_UNMUTE__") _unmuteVideo();
    });

    const _waitForVideo = () => {
      const video = document.querySelector("video");
      if (video) {
        if (video.readyState >= 3 && video.currentTime > 0) {
          _notifyCanPlay();
        } else {
          video.addEventListener("playing", _notifyCanPlay, { once: true });
        }
      }
    };
    const _videoWatcher = new MutationObserver(() => {
      if (document.querySelector("video")) { _videoWatcher.disconnect(); _waitForVideo(); }
    });
    if (document.querySelector("video")) _waitForVideo();
    else _videoWatcher.observe(document.body || document.documentElement, { childList: true, subtree: true });

    const protectMenu = (menu) => {
      if (menu.__ytProtecting) return;
      menu.__ytProtecting = true;

      const ac = new AbortController();
      const { signal } = ac;
      const block = (e) => {
        if (!menu.contains(e.target)) {
          e.stopImmediatePropagation();
          e.stopPropagation();
        }
      };
      const opts = { capture: true, signal };
      menu.addEventListener("mouseleave",   (e) => e.stopImmediatePropagation(), opts);
      menu.addEventListener("mouseout",     (e) => e.stopImmediatePropagation(), opts);
      menu.addEventListener("pointerleave", (e) => e.stopImmediatePropagation(), opts);
      window.addEventListener("blur",       (e) => e.stopImmediatePropagation(), opts);
      document.addEventListener("mousedown",  block, opts);
      document.addEventListener("pointerdown", block, opts);

      const closeWatcher = new MutationObserver(() => {
        if (menu.style.display === "none" || !menu.isConnected) {
          ac.abort();
          menu.__ytProtecting = false;
          closeWatcher.disconnect();
        }
      });
      closeWatcher.observe(menu, { attributes: true, attributeFilter: ["style"] });
    };

    const menuObserver = new MutationObserver(() => {
      const menu = document.querySelector(".ytp-settings-menu");
      if (menu && menu.style.display !== "none") protectMenu(menu);
    });
    CleanupManager.addObserver(menuObserver);
    menuObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });

    const dialogObserver = new MutationObserver(() => {
      const dialog = document.querySelector("tp-yt-paper-toast, yt-notification-action-renderer, yt-confirm-dialog-renderer");
      if (dialog) {
        const closeBtn = dialog.querySelector("#close-button button, #close-button");
        const btn = dialog.querySelector("button, #confirm-button, yt-button-renderer");
        if (closeBtn) { closeBtn.click(); } else if (btn) { btn.click(); }
        dialog.style.setProperty("display", "none", "important");
      }
    });
    CleanupManager.addObserver(dialogObserver);
    dialogObserver.observe(document.body, { childList: true, subtree: true });

    const OVERLAY_SELECTORS = [
      "ytd-reel-player-overlay-renderer", "ytd-reel-player-header-renderer",
      "ytd-shorts-player-controls", "ytd-shorts-bottom-action-bar-renderer", "#shorts-player-controls",
    ].join(", ");
    const forceHideOverlays = () => {
      document.querySelectorAll(OVERLAY_SELECTORS).forEach(el => {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
      });
      document.querySelectorAll("ytd-reel-video-renderer #overlay, ytd-reel-video-renderer .overlay").forEach(el => {
        el.style.setProperty("display", "none", "important");
      });
    };
    const overlayObserver = new MutationObserver(forceHideOverlays);
    CleanupManager.addObserver(overlayObserver);
    overlayObserver.observe(document.body, { childList: true, subtree: true });
    forceHideOverlays();

    let _toastTimer = null;
    let _settingsClickCount = 0;
    let _settingsClickResetTimer = null;

    const clickHintHandler = (e) => {
      if (e.target.closest(".ytp-settings-button")) {
        _settingsClickCount++;

        clearTimeout(_settingsClickResetTimer);
        _settingsClickResetTimer = setTimeout(() => {
          _settingsClickCount = 0;
        }, 3000);

        if (_settingsClickCount < 2) return;
        let toast = document.getElementById("yt-adblock-hint-toast");
        if (!toast) {
          toast = document.createElement("div");
          toast.id = "yt-adblock-hint-toast";
          toast.textContent = "If the ⚙️ menu fails to open, please check your ad-blocker's filter lists.";
          toast.style.cssText = `
            position: fixed; bottom: 75px; left: 50%; transform: translateX(-50%);
            background: rgba(45, 45, 45, 0.65); color: #fff; padding: 10px 18px;
            border-radius: 8px; font-size: 13px; font-weight: 500;
            backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
            z-index: 2147483647; pointer-events: none; opacity: 0;
            transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); white-space: nowrap;
          `;
          document.body.appendChild(toast);
        }

        toast.style.opacity = "0";
        void toast.offsetWidth;
        toast.style.opacity = "1";

        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => {
          if (toast) toast.style.opacity = "0";
        }, 4000);
      }
    };
    CleanupManager.addListener(document, "click", clickHintHandler, { capture: true });

    return;
  }

  const DEFAULTS = {
    ytLanguage: "en",
    ytThumbButtonSize: 24,
    ytThumbFontSize: 16,
    ytThumbOpacity: 0.7,
    ytButtonSpacing: 12,
    ytButtonsAlwaysVisible: false,
    ytShowPlayBtn: true,
    ytShowCommentBtn: true,
    ytOverlayOpacity: 0.85,
    ytPopupButtonOffset: 56,
    ytPopupSymbolSize: 24,
    ytPopupSymbolOpacity: 0.8,
    ytPlayerSizeIndex: 1,
    yt_comment_api_key: "",
    ytTransitionEnabled: false,
    ytTransitionStyle: "scan",
    ytTransitionDelay: 600,
  };

  const getCfg = (key) => {
    try {
      const val = GM_getValue(key, DEFAULTS[key]);
      return val !== undefined ? val : DEFAULTS[key];
    } catch (e) {
      return DEFAULTS[key];
    }
  };

  const LANG_DICT = {
    panel_title: {
      en: "YouTube Preview Console",
      "zh-TW": "YouTube 預覽控制台",
      "zh-CN": "YouTube 预览控制台",
      ja: "YouTube プレビューコンソール",
      ko: "YouTube 미리보기 콘솔",
      es: "Consola de Vista Previa de YouTube",
      "pt-BR": "Console de Visualização do YouTube",
      fr: "Console de Prévisualisation YouTube",
    },
    btn_settings: {
      en: "Button Settings (Live)",
      "zh-TW": "按鈕設定 (即時)",
      "zh-CN": "按钮设置 (实时)",
      ja: "ボタン設定 (リアルタイム)",
      ko: "버튼 설정 (실시간)",
      es: "Configuración de botones (En vivo)",
      "pt-BR": "Configurações de botões (Ao vivo)",
      fr: "Paramètres des boutons (En direct)",
    },
    size: { en: "Size", "zh-TW": "大小", "zh-CN": "大小", ja: "サイズ", ko: "크기", es: "Tamaño", "pt-BR": "Tamanho", fr: "Taille" },
    font: { en: "Font", "zh-TW": "字體", "zh-CN": "字体", ja: "フォント", ko: "글꼴", es: "Fuente", "pt-BR": "Fonte", fr: "Police" },
    opacity: { en: "Opacity", "zh-TW": "透明", "zh-CN": "透明度", ja: "透明度", ko: "불투명도", es: "Opacidad", "pt-BR": "Opacidade", fr: "Opacité" },
    spacing: { en: "Spacing", "zh-TW": "間距", "zh-CN": "间距", ja: "間隔", ko: "간격", es: "Espaciado", "pt-BR": "Espaçamento", fr: "Espacement" },
    refresh_note: {
      en: "(Refresh required for Layout/Spacing)",
      "zh-TW": "(間距/排列修改後需刷新)",
      "zh-CN": "(修改间距/排列后需刷新)",
      ja: "(レイアウト/間隔の変更後はリフレッシュが必要)",
      ko: "(레이아웃/간격 변경 후 새로고침 필요)",
      es: "(Actualización requerida para Diseño/Espaciado)",
      "pt-BR": "(Atualização necessária para Layout/Espaçamento)",
      fr: "(Actualisation requise pour Disposition/Espacement)",
    },
    always_visible: {
      en: "Always Visible",
      "zh-TW": "常駐顯示",
      "zh-CN": "常驻显示",
      ja: "常時表示",
      ko: "항상 표시",
      es: "Siempre visible",
      "pt-BR": "Sempre visível",
      fr: "Toujours visible",
    },
    show_play_btn: {
      en: "Show ▶ Play button",
      "zh-TW": "顯示 ▶ 播放按鈕",
      "zh-CN": "显示 ▶ 播放按钮",
      ja: "▶ 再生ボタンを表示",
      ko: "▶ 재생 버튼 표시",
      es: "Mostrar botón ▶ Reproducir",
      "pt-BR": "Mostrar botão ▶ Reproduzir",
      fr: "Afficher le bouton ▶ Lire",
    },
    show_comment_btn: {
      en: "Show 💬 Comment button",
      "zh-TW": "顯示 💬 留言按鈕",
      "zh-CN": "显示 💬 评论按钮",
      ja: "💬 コメントボタンを表示",
      ko: "💬 댓글 버튼 표시",
      es: "Mostrar botón 💬 Comentarios",
      "pt-BR": "Mostrar botão 💬 Comentários",
      fr: "Afficher le bouton 💬 Commentaires",
    },
    player_settings: {
      en: "Player Settings (Live)",
      "zh-TW": "播放器設定 (即時)",
      "zh-CN": "播放器设置 (实时)",
      ja: "プレイヤー設定 (リアルタイム)",
      ko: "플레이어 설정 (실시간)",
      es: "Configuración del reproductor (En vivo)",
      "pt-BR": "Configurações do reprodutor (Ao vivo)",
      fr: "Paramètres du lecteur (En direct)",
    },
    bg_density: { en: "BG Density", "zh-TW": "黑幕濃度", "zh-CN": "黑幕浓度", ja: "背景濃度", ko: "배경 밀도", es: "Densidad de fondo", "pt-BR": "Densidade de fundo", fr: "Densité d'arrière-plan" },
    v_pos: { en: "V-Pos", "zh-TW": "垂直位置", "zh-CN": "垂直位置", ja: "垂直位置", ko: "수직 위치", es: "Pos. vertical", "pt-BR": "Pos. vertical", fr: "Pos. verticale" },
    icon_size: { en: "Icon Size", "zh-TW": "符號大小", "zh-CN": "图标大小", ja: "アイコンサイズ", ko: "아이콘 크기", es: "Tamaño de icono", "pt-BR": "Tamanho do ícone", fr: "Taille de l'icône" },
    icon_opacity: {
      en: "Icon Opacity",
      "zh-TW": "符號透明",
      "zh-CN": "图标透明度",
      ja: "アイコン透明度",
      ko: "아이콘 불투명도",
      es: "Opacidad del icono",
      "pt-BR": "Opacidade do ícone",
      fr: "Opacité de l'icône",
    },
    reset: { en: "Reset", "zh-TW": "重置", "zh-CN": "重置", ja: "リセット", ko: "초기화", es: "Restablecer", "pt-BR": "Redefinir", fr: "Réinitialiser" },
    save: {
      en: "Save & Refresh",
      "zh-TW": "儲存並刷新",
      "zh-CN": "保存并刷新",
      ja: "保存してリフレッシュ",
      ko: "저장 후 새로고침",
      es: "Guardar y actualizar",
      "pt-BR": "Salvar e atualizar",
      fr: "Enregistrer et actualiser",
    },
    confirm_reset: {
      en: "Reset to defaults?",
      "zh-TW": "恢復預設?",
      "zh-CN": "恢复默认?",
      ja: "デフォルトに戻しますか?",
      ko: "기본값으로 초기화할까요?",
      es: "¿Restablecer a valores predeterminados?",
      "pt-BR": "Redefinir para padrões?",
      fr: "Réinitialiser aux valeurs par défaut ?",
    },

    close: {
      en: "Close (Esc)",
      "zh-TW": "關閉 (Esc)",
      "zh-CN": "关闭 (Esc)",
      ja: "閉じる (Esc)",
      ko: "닫기 (Esc)",
      es: "Cerrar (Esc)",
      "pt-BR": "Fechar (Esc)",
      fr: "Fermer (Échap)",
    },
    resize: { en: "Toggle Size", "zh-TW": "切換大小", "zh-CN": "切换大小", ja: "サイズ切替", ko: "크기 전환", es: "Cambiar tamaño", "pt-BR": "Alternar tamanho", fr: "Changer la taille" },
    speed: { en: "Speed", "zh-TW": "播放速度", "zh-CN": "播放速度", ja: "速度", ko: "재생 속도", es: "Velocidad", "pt-BR": "Velocidade", fr: "Vitesse" },
    quality: { en: "Quality", "zh-TW": "解析度", "zh-CN": "分辨率", ja: "画質", ko: "해상도", es: "Calidad", "pt-BR": "Qualidade", fr: "Qualité" },
    widescreen: {
      en: "Widescreen (Fit)",
      "zh-TW": "寬螢幕 (Fit)",
      "zh-CN": "宽屏 (Fit)",
      ja: "ワイドスクリーン (Fit)",
      ko: "와이드스크린 (Fit)",
      es: "Pantalla ancha (Ajustar)",
      "pt-BR": "Tela larga (Ajustar)",
      fr: "Écran large (Ajuster)",
    },

    c_preview: {
      en: "Comments Preview",
      "zh-TW": "留言預覽",
      "zh-CN": "评论预览",
      ja: "コメントプレビュー",
      ko: "댓글 미리보기",
      es: "Vista previa de comentarios",
      "pt-BR": "Pré-visualização de comentários",
      fr: "Aperçu des commentaires",
    },
    c_sort: { en: "Sort", "zh-TW": "排序", "zh-CN": "排序", ja: "並び替え", ko: "정렬", es: "Ordenar", "pt-BR": "Ordenar", fr: "Trier" },
    c_relevance: { en: "Top", "zh-TW": "熱門", "zh-CN": "热门", ja: "人気順", ko: "인기순", es: "Popular", "pt-BR": "Popular", fr: "Populaire" },
    c_time: { en: "Newest", "zh-TW": "最新", "zh-CN": "最新", ja: "新着順", ko: "최신순", es: "Más reciente", "pt-BR": "Mais recente", fr: "Plus récent" },
    c_count: { en: "Count", "zh-TW": "數量", "zh-CN": "数量", ja: "件数", ko: "개수", es: "Cantidad", "pt-BR": "Quantidade", fr: "Nombre" },
    c_trans: { en: "Translate", "zh-TW": "翻譯", "zh-CN": "翻译", ja: "翻訳", ko: "번역", es: "Traducir", "pt-BR": "Traduzir", fr: "Traduire" },
    c_search: {
      en: "Search comments...",
      "zh-TW": "搜尋留言...",
      "zh-CN": "搜索评论...",
      ja: "コメント検索...",
      ko: "댓글 검색...",
      es: "Buscar comentarios...",
      "pt-BR": "Pesquisar comentários...",
      fr: "Rechercher des commentaires...",
    },
    c_loading: { en: "Loading...", "zh-TW": "載入中...", "zh-CN": "加载中...", ja: "読み込み中...", ko: "로딩 중...", es: "Cargando...", "pt-BR": "Carregando...", fr: "Chargement..." },
    c_no_comments: {
      en: "No comments",
      "zh-TW": "無留言",
      "zh-CN": "暂无评论",
      ja: "コメントなし",
      ko: "댓글 없음",
      es: "Sin comentarios",
      "pt-BR": "Sem comentários",
      fr: "Aucun commentaire",
    },
    c_api: { en: "⚙️ API", "zh-TW": "⚙️ API", "zh-CN": "⚙️ API", ja: "⚙️ API", ko: "⚙️ API", es: "⚙️ API", "pt-BR": "⚙️ API", fr: "⚙️ API" },
    c_err_parse: {
      en: "Parse Error",
      "zh-TW": "解析錯誤",
      "zh-CN": "解析错误",
      ja: "解析エラー",
      ko: "파싱 오류",
      es: "Error de análisis",
      "pt-BR": "Erro de análise",
      fr: "Erreur d'analyse",
    },
    c_err_net: {
      en: "Network Error",
      "zh-TW": "網絡錯誤",
      "zh-CN": "网络错误",
      ja: "ネットワークエラー",
      ko: "네트워크 오류",
      es: "Error de red",
      "pt-BR": "Erro de rede",
      fr: "Erreur réseau",
    },

    api_title: {
      en: "API Key Setup",
      "zh-TW": "API Key 設定",
      "zh-CN": "API Key 设置",
      ja: "APIキー設定",
      ko: "API 키 설정",
      es: "Configuración de clave API",
      "pt-BR": "Configuração de chave API",
      fr: "Configuration de la clé API",
    },
    api_desc: {
      en: "Enter Google YouTube Data API v3 Key",
      "zh-TW": "請輸入 Google YouTube Data API v3 Key",
      "zh-CN": "请输入 Google YouTube Data API v3 Key",
      ja: "Google YouTube Data API v3 キーを入力してください",
      ko: "Google YouTube Data API v3 키를 입력하세요",
      es: "Ingrese la clave de API de YouTube Data v3 de Google",
      "pt-BR": "Insira a chave de API do Google YouTube Data v3",
      fr: "Entrez la clé API Google YouTube Data v3",
    },
    api_del: { en: "Delete", "zh-TW": "刪除", "zh-CN": "删除", ja: "削除", ko: "삭제", es: "Eliminar", "pt-BR": "Excluir", fr: "Supprimer" },
    api_apply: {
      en: "Get API Key",
      "zh-TW": "申請 API Key",
      "zh-CN": "申请 API Key",
      ja: "APIキーを取得",
      ko: "API 키 발급",
      es: "Obtener clave API",
      "pt-BR": "Obter chave API",
      fr: "Obtenir une clé API",
    },
    api_deleted_msg: {
      en: "API Key Deleted",
      "zh-TW": "API Key 已刪除",
      "zh-CN": "API Key 已删除",
      ja: "APIキーが削除されました",
      ko: "API 키가 삭제되었습니다",
      es: "Clave API eliminada",
      "pt-BR": "Chave API excluída",
      fr: "Clé API supprimée",
    },

    lang_switch_title: {
      en: "Switch Language",
      "zh-TW": "切換語言",
      "zh-CN": "切换语言",
      ja: "言語を切り替える",
      ko: "언어 전환",
      es: "Cambiar idioma",
      "pt-BR": "Mudar idioma",
      fr: "Changer de langue",
    },
    lang_switch_msg: {
      en: "Switch interface language to: ",
      "zh-TW": "將介面語言切換為：",
      "zh-CN": "将界面语言切换为：",
      ja: "インターフェース言語を切り替えます：",
      ko: "인터페이스 언어를 전환합니다：",
      es: "Cambiar el idioma de la interfaz a: ",
      "pt-BR": "Mudar o idioma da interface para: ",
      fr: "Changer la langue de l'interface en : ",
    },
    lang_switch_confirm: {
      en: "Switch & Refresh",
      "zh-TW": "切換並刷新",
      "zh-CN": "切换并刷新",
      ja: "切り替えてリフレッシュ",
      ko: "전환 후 새로고침",
      es: "Cambiar y actualizar",
      "pt-BR": "Mudar e atualizar",
      fr: "Changer et actualiser",
    },
    lang_switch_cancel: {
      en: "Cancel",
      "zh-TW": "取消",
      "zh-CN": "取消",
      ja: "キャンセル",
      ko: "취소",
      es: "Cancelar",
      "pt-BR": "Cancelar",
      fr: "Annuler",
    },
    lang_top_group: {
      en: "⭐ Recent",
      "zh-TW": "⭐ 常用",
      "zh-CN": "⭐ 常用",
      ja: "⭐ よく使う",
      ko: "⭐ 자주 사용",
      es: "⭐ Recientes",
      "pt-BR": "⭐ Recentes",
      fr: "⭐ Récents",
    },
    mini_play: {
      en: "▶️ Mini",
      "zh-TW": "▶️ 小窗",
      "zh-CN": "▶️ 小窗",
      ja: "▶️ ミニ",
      ko: "▶️ 미니",
      es: "▶️ Mini",
      "pt-BR": "▶️ Mini",
      fr: "▶️ Mini",
    },
    transition_anim: {
      en: "Transition Animation",
      "zh-TW": "過渡動畫",
      "zh-CN": "过渡动画",
      ja: "トランジションアニメーション",
      ko: "전환 애니메이션",
      es: "Animación de transición",
      "pt-BR": "Animação de transição",
      fr: "Animation de transition",
    },
    transition_style: {
      en: "Style",
      "zh-TW": "風格",
      "zh-CN": "风格",
      ja: "スタイル",
      ko: "스타일",
      es: "Estilo",
      "pt-BR": "Estilo",
      fr: "Style",
    },
    ts_scan: {
      en: "Cinematic Scan",
      "zh-TW": "電影掃描",
      "zh-CN": "电影扫描",
      ja: "シネマスキャン",
      ko: "시네마 스캔",
      es: "Escaneo Cinemático",
      "pt-BR": "Scan Cinematográfico",
      fr: "Scan Cinématique",
    },
    ts_burst: {
      en: "Particle Burst",
      "zh-TW": "粒子爆發",
      "zh-CN": "粒子爆发",
      ja: "パーティクルバースト",
      ko: "파티클 버스트",
      es: "Explosión de Partículas",
      "pt-BR": "Explosão de Partículas",
      fr: "Explosion de Particules",
    },
    ts_mono: {
      en: "Minimal Mono",
      "zh-TW": "極簡純色",
      "zh-CN": "极简纯色",
      ja: "ミニマルモノ",
      ko: "미니멀 모노",
      es: "Mono Minimalista",
      "pt-BR": "Mono Minimalista",
      fr: "Mono Minimaliste",
    },
    ts_glass: {
      en: "Liquid Glass",
      "zh-TW": "流體玻璃",
      "zh-CN": "流体玻璃",
      ja: "リキッドグラス",
      ko: "리퀴드 글라스",
      es: "Vidrio Líquido",
      "pt-BR": "Vidro Líquido",
      fr: "Verre Liquide",
    },
    transition_delay: {
      en: "UI Settle Wait (ms)",
      "zh-TW": "UI 穩定等待 (ms)",
      "zh-CN": "UI 稳定等待 (ms)",
      ja: "UI 安定待機 (ms)",
      ko: "UI 안정 대기 (ms)",
      es: "Espera de estabilización UI (ms)",
      "pt-BR": "Espera de estabilização UI (ms)",
      fr: "Délai de stabilisation UI (ms)",
    },
    player_side_hint: {
      en: "💡 When player is open, panel shifts to the left for easy adjustments",
      "zh-TW": "💡 開啟播放器後，面板會自動移至左側以便即時調整",
      "zh-CN": "💡 开启播放器后，面板会自动移至左侧以便实时调整",
      ja: "💡 プレイヤーが開いているとき、パネルは左側に移動して調整しやすくします",
      ko: "💡 플레이어가 열리면 패널이 왼쪽으로 이동하여 쉽게 조정할 수 있습니다",
      es: "💡 Cuando el reproductor está abierto, el panel se desplaza a la izquierda para facilitar los ajustes",
      "pt-BR": "💡 Quando o player estiver aberto, o painel se move para a esquerda para facilitar os ajustes",
      fr: "💡 Lorsque le lecteur est ouvert, le panneau se déplace à gauche pour faciliter les réglages",
    },
    status_buffering: {
      en: "BUFFERING",
      "zh-TW": "緩衝中",
      "zh-CN": "缓冲中",
      ja: "バッファリング中",
      ko: "버퍼링 중",
      es: "ALMACENANDO EN BÚFER",
      "pt-BR": "CARREGANDO",
      fr: "MISE EN MÉMOIRE TAMPON",
    },
    status_initializing: {
      en: "INITIALIZING",
      "zh-TW": "初始化中",
      "zh-CN": "初始化中",
      ja: "初期化中",
      ko: "초기화 중",
      es: "INICIALIZANDO",
      "pt-BR": "INICIALIZANDO",
      fr: "INITIALISATION",
    },
    save_done: {
      en: "✅ Saved!",
      "zh-TW": "✅ 已儲存！",
      "zh-CN": "✅ 已保存！",
      ja: "✅ 保存しました！",
      ko: "✅ 저장됨！",
      es: "✅ ¡Guardado!",
      "pt-BR": "✅ Salvo!",
      fr: "✅ Enregistré !",
    },
    save_countdown: {
      en: "(Refreshing in ${n}s)",
      "zh-TW": "（${n}s 後刷新）",
      "zh-CN": "（${n}s 后刷新）",
      ja: "（${n}秒後にリフレッシュ）",
      ko: "（${n}초 후 새로고침）",
      es: "(Actualizando en ${n}s)",
      "pt-BR": "(Atualizando em ${n}s)",
      fr: "(Actualisation dans ${n}s)",
    },
    copy_url: {
      en: "Copy URL",
      "zh-TW": "複製連結",
      "zh-CN": "复制链接",
      ja: "URLをコピー",
      ko: "URL 복사",
      es: "Copiar URL",
      "pt-BR": "Copiar URL",
      fr: "Copier l'URL",
    },
  };

  const SUPPORTED_LANGS = ["en", "zh-TW", "zh-CN", "ja", "ko", "es", "pt-BR", "fr"];
  const LANG_LABELS = {
    en: "English",
    "zh-TW": "繁體中文",
    "zh-CN": "简体中文",
    ja: "日本語",
    ko: "한국어",
    es: "Español",
    "pt-BR": "Português (BR)",
    fr: "Français",
  };
  const LANG_FLAGS = {
    en: "🇺🇸", "zh-TW": "🇹🇼", "zh-CN": "🇨🇳",
    ja: "🇯🇵", ko: "🇰🇷", es: "🇪🇸", "pt-BR": "🇧🇷", fr: "🇫🇷",
  };

  const _savedLang = getCfg("ytLanguage");
  const currentLang = SUPPORTED_LANGS.includes(_savedLang) ? _savedLang : "en";
  const txt = (key) => LANG_DICT[key]?.[currentLang] ?? LANG_DICT[key]?.["en"] ?? key;
  
  const txtF = (key, params) => {
    let s = txt(key);
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`\${${k}}`, v);
    }
    return s;
  };

  function showLangSwitchDialog(targetLang, onConfirm, onCancel) {
    document.getElementById("yt-lang-switch-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "yt-lang-switch-overlay";
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 2147483647;
      background: rgba(0, 0, 0, 0.82);
      display: flex; align-items: center; justify-content: center;
      animation: ytLangFadeIn 0.18s ease;
    `;

    if (!document.getElementById("yt-lang-switch-style")) {
      const ks = document.createElement("style");
      ks.id = "yt-lang-switch-style";
      ks.textContent = `
        @keyframes ytLangFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ytLangSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        #yt-lang-switch-dialog button:hover { filter: brightness(1.15); }
      `;
      document.head.appendChild(ks);
    }

    const targetLabel = LANG_LABELS[targetLang] || targetLang;

    const dialog = document.createElement("div");
    dialog.id = "yt-lang-switch-dialog";
    dialog.style.cssText = `
      background: #1e1e1e; color: #fff; border-radius: 14px;
      padding: 32px 36px; min-width: 300px; max-width: 420px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.85);
      display: flex; flex-direction: column; gap: 20px;
      animation: ytLangSlideUp 0.22s cubic-bezier(.25,.8,.25,1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      border: 1px solid #333;
    `;

    const FLAG = LANG_FLAGS;

    const titleRow = document.createElement("div");
    titleRow.style.cssText = "display:flex; align-items:center; gap:10px;";
    const globeSpan = document.createElement("span");
    globeSpan.style.cssText = "font-size:26px; line-height:1;";
    globeSpan.textContent = "🌐";
    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = "font-size:18px; font-weight:700; color:#3ea6ff;";
    titleSpan.textContent = txt("lang_switch_title");
    titleRow.appendChild(globeSpan);
    titleRow.appendChild(titleSpan);

    const msgRow = document.createElement("div");
    msgRow.style.cssText = "font-size:15px; color:#ccc; line-height:1.6;";
    msgRow.appendChild(document.createTextNode(txt("lang_switch_msg")));
    const flagSpan = document.createElement("span");
    flagSpan.style.cssText = "font-size:22px; margin-left:4px;";
    flagSpan.textContent = FLAG[targetLang] || "🌐";
    const labelStrong = document.createElement("strong");
    labelStrong.style.cssText = "color:#fff; margin-left:4px;";
    labelStrong.textContent = targetLabel;
    msgRow.appendChild(flagSpan);
    msgRow.appendChild(labelStrong);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex; gap:12px; justify-content:flex-end; margin-top:4px;";
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "yt-lang-cancel";
    cancelBtn.textContent = txt("lang_switch_cancel");
    cancelBtn.style.cssText = "padding:8px 20px;border-radius:6px;border:1px solid #555;background:#333;color:#ccc;cursor:pointer;font-size:14px;transition:filter 0.15s;";
    const confirmBtn = document.createElement("button");
    confirmBtn.id = "yt-lang-confirm";
    confirmBtn.textContent = txt("lang_switch_confirm");
    confirmBtn.style.cssText = "padding:8px 20px;border-radius:6px;border:none;background:#3ea6ff;color:#000;cursor:pointer;font-size:14px;font-weight:700;transition:filter 0.15s;";
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);

    dialog.appendChild(titleRow);
    dialog.appendChild(msgRow);
    dialog.appendChild(btnRow);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const escHandler = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        onCancel?.();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        onCancel?.();
        document.removeEventListener("keydown", escHandler);
      }
    });

    dialog.querySelector("#yt-lang-cancel").onclick = () => {
      overlay.remove();
      onCancel?.();
      document.removeEventListener("keydown", escHandler);
    };

    dialog.querySelector("#yt-lang-confirm").onclick = () => {
      const confirmBtnEl = dialog.querySelector("#yt-lang-confirm");
      confirmBtnEl.disabled = true;
      confirmBtnEl.textContent = "⏳ ...";
      document.removeEventListener("keydown", escHandler);

      GM_setValue("ytLanguage", targetLang);
      setTimeout(() => {
        overlay.remove();
        onConfirm?.();
        window.location.reload();
      }, 600);
    };
  }

  let API_KEY = getCfg("yt_comment_api_key");
  const COMMENT_API = "https://www.googleapis.com/youtube/v3/commentThreads";

  const LANG_LABEL_MAP = {
    "zh-TW":"繁體中文","zh-CN":"简体中文","ja":"日本語","ko":"한국어","mn":"Монгол",
    "th":"ภาษาไทย","vi":"Tiếng Việt","id":"Bahasa Indonesia","ms":"Bahasa Melayu",
    "tl":"Filipino","km":"ភាសាខ្មែរ","lo":"ພາສາລາວ","my":"မြန်မာဘာသာ",
    "hi":"हिन्दी","bn":"বাংলা","ur":"اردو","ne":"नेपाली","si":"සිංහල",
    "en":"English","fr":"Français","de":"Deutsch","es":"Español","pt":"Português",
    "it":"Italiano","nl":"Nederlands","ca":"Català",
    "sv":"Svenska","no":"Norsk","da":"Dansk","fi":"Suomi","is":"Íslenska",
    "ru":"Русский","uk":"Українська","pl":"Polski","cs":"Čeština","sk":"Slovenčina",
    "hu":"Magyar","ro":"Română","bg":"Български","hr":"Hrvatski","sr":"Српски",
    "sl":"Slovenščina","lt":"Lietuvių","lv":"Latviešu","et":"Eesti",
    "mk":"Македонски","sq":"Shqip","mt":"Malti","el":"Ελληνικά",
    "ar":"العربية","he":"עברית","fa":"فارسی","tr":"Türkçe",
    "az":"Azərbaycan","ka":"ქართული","hy":"Հայերեն",
    "kk":"Қазақша","uz":"Oʻzbekcha",
    "sw":"Kiswahili","af":"Afrikaans","am":"አማርኛ","yo":"Yorùbá","ha":"Hausa","zu":"isiZulu",
  };
  const LANG_HITS_KEY = "ytTransLangHits";
  const TOP_LANG_MAX  = 3;

  function getLangHits() {
    try { return JSON.parse(GM_getValue(LANG_HITS_KEY, "{}")); } catch (_) { return {}; }
  }

  function bumpLangHit(code) {
    if (!code) return;
    const hits = getLangHits();
    hits[code] = (hits[code] || 0) + 1;
    GM_setValue(LANG_HITS_KEY, JSON.stringify(hits));
  }

  function prependTopLangs(sel) {
    sel.querySelector("#c-lang-top-group")?.remove();

    const hits  = getLangHits();
    const top   = Object.entries(hits)
      .filter(([, n]) => n >= 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, TOP_LANG_MAX);

    if (top.length === 0) return;

    const saved = sel.value;
    const grp   = document.createElement("optgroup");
    grp.id      = "c-lang-top-group";
    grp.label   = txt("lang_top_group");

    top.forEach(([code, count]) => {
      const opt       = document.createElement("option");
      opt.value       = code;
      opt.textContent = `${LANG_LABEL_MAP[code] || code}  ×${count}`;
      grp.appendChild(opt);
    });

    const afterEl = sel.options[1]?.closest("optgroup") || sel.children[1] || null;
    sel.insertBefore(grp, afterEl);
    sel.value = saved;
  }

  function _szWide(maxVwRatio) {
    const w = Math.floor(window.innerWidth  * maxVwRatio);
    const h = Math.min(Math.round(w * 9 / 16), Math.floor(window.innerHeight * 0.88));
    return { width: Math.min(w, Math.round(h * 16 / 9)) + "px", height: h + "px" };
  }
  function _szShort(maxVhRatio) {
    const h = Math.floor(window.innerHeight * maxVhRatio);
    const w = Math.min(Math.round(h * 9 / 16), Math.floor(window.innerWidth * 0.92));
    return { width: w + "px", height: Math.min(h, Math.round(w * 16 / 9)) + "px" };
  }

  const SIZE_OPTIONS = [
    { name: "S",                 wide: () => _szWide(0.45), short: () => _szShort(0.50) },
    { name: "M",                 wide: () => _szWide(0.65), short: () => _szShort(0.70) },
    { name: "L",                 wide: () => _szWide(0.82), short: () => _szShort(0.85) },
    { name: txt("widescreen"),   wide: "fit",               short: "fit"                },
    { name: "MAX",               wide: () => _szWide(0.95), short: () => _szShort(0.95) },
  ];

  let currentSizeIndex = parseInt(getCfg("ytPlayerSizeIndex"));
  if (
    isNaN(currentSizeIndex) ||
    currentSizeIndex < 0 ||
    currentSizeIndex >= SIZE_OPTIONS.length
  ) {
    currentSizeIndex = 1;
  }

  let persistentOverlay = null;
  let messageListener = null;
  let currentAbortController = null;
  let ytUserInteracting = false;

  const ID = "embedded-youtube-fix";
  const _crashDetectorHandler = (e) => {
    if (e.data === ID) {
      e.stopImmediatePropagation();
      if (document.querySelector(".ytp-error")) {
        e.source?.postMessage(ID, e.origin);
      }
    }
  };
  CleanupManager.addListener(window, "message", _crashDetectorHandler);

  GM_registerMenuCommand("⚙️ Open Settings", createControlPanel);
  GM_registerMenuCommand("🔑 Import API Key", () => showApiKeyPrompt());

  const style = document.createElement("style");
  style.textContent = `
        ytd-thumbnail, #thumbnail, .yt-preview-container { overflow: visible !important; contain: none !important; z-index: auto; }
        ytd-rich-item-renderer { overflow: visible !important; }
        .yt-preview-play-btn, .yt-preview-comment-btn {
            position: absolute !important;
            width: ${getCfg("ytThumbButtonSize")}px;
            height: ${getCfg("ytThumbButtonSize")}px;
            font-size: ${getCfg("ytThumbFontSize")}px;
            background: rgba(0,0,0,${getCfg("ytThumbOpacity")});
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 99999 !important;
            user-select: none;
            opacity: ${getCfg("ytButtonsAlwaysVisible") ? 1 : 0};
            transition: opacity .2s, transform .2s, background-color .2s;
            pointer-events: auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        @keyframes yt-spin-loader { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes yt-pop-ready { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1.15); } }
        .yt-preview-play-btn.loading::before {
            content: ''; position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px;
            border-radius: 50%; border: 2px solid transparent; border-top-color: #3ea6ff;
            border-right-color: rgba(62,166,255,0.3);
            animation: yt-spin-loader 1s linear infinite;
        }
        .yt-preview-play-btn.ready {
            background-color: #ff0000 !important; color: #fff !important;
            transform: scale(1.15);
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.7) !important;
            animation: yt-pop-ready 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .yt-preview-container:hover .yt-preview-play-btn,
        .yt-preview-container:hover .yt-preview-comment-btn { opacity: 1 !important; }
        .yt-preview-play-btn:active, .yt-preview-comment-btn:active { transform: scale(0.9); }
        #yt-preview-popup { transition: opacity 0.2s ease; }
        #yt-master-control-panel {
            position: fixed; top: 70px; right: 20px; z-index: 2147483650;
            background: rgba(20,20,20,0.98);
            padding: 20px; border-radius: 12px; color: #eee; font-size: 14px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8); border: 1px solid #444;
            max-height: 85vh; overflow-y: auto; width: 400px;
            transition: left 0.25s ease, right 0.25s ease;
        }
        
        body.yt-preview-playing #yt-master-control-panel {
            right: auto; left: 20px;
        }
        .translated-text {
            background: #222; color: #ffd700; padding: 4px 8px; margin-top: 4px;
            border-radius: 4px; border-left: 3px solid #ffd700;
        }
        .common-control {
            height: 28px; font-size: 13px; padding: 2px 6px; line-height: 1.2;
            border: 1px solid #444; border-radius: 4px; background-color: #333;
            color: white; box-sizing: border-box;
        }
        .yt-comment-btn-hover:hover { opacity: 1 !important; transform: scale(1.05); }
        
        body.yt-panel-open .yt-preview-play-btn,
        body.yt-panel-open .yt-preview-comment-btn { opacity: 1 !important; }

        body.yt-preview-playing ytd-app {
            pointer-events: none !important; 
            user-select: none !important;
        }
        body.yt-preview-playing ytd-app * {
            animation-play-state: paused !important; 
        }

        #yt-transition-overlay {
            position: fixed; inset: 0; z-index: 2147483649;
            background: #000;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            pointer-events: none;
            transition: opacity 0.45s ease;
        }
        #yt-transition-overlay.fade-out { opacity: 0; }

        @keyframes ytScanBar {
            0%   { transform: translateY(0); opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; } 
        }
        @keyframes ytScanLines {
            0%   { transform: translateY(0); }
            100% { transform: translateY(8px); }
        }
        @keyframes ytScanPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(62,166,255,0.5); transform: scale(1); }
            50%       { box-shadow: 0 0 0 14px rgba(62,166,255,0); transform: scale(1.06); }
        }
        @keyframes ytScanBlink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.25; }
        }

        @keyframes ytBurstRing {
            0%   { transform: scale(0.5); opacity: 0; }
            25%  { opacity: 1; }
            100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ytBurstFloat {
            0%   { transform: translateY(220px) scale(0); opacity: 0; }
            10%  { opacity: 0.9; }
            90%  { opacity: 0.6; }
            100% { transform: translateY(-30px) scale(1.4); opacity: 0; }
        }
        @keyframes ytBurstPlay {
            0%, 100% { transform: scale(0.94); }
            50%       { transform: scale(1.08); }
        }

        @keyframes ytGlassArc {
            to { transform: rotate(360deg); }
        }
        @keyframes ytOrbFloat {
            0%, 100% { transform: translate(0,0) scale(1); }
            50%       { transform: translate(18px,12px) scale(1.12); }
        }
        @keyframes ytGlassPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(108,62,240,0.45); }
            50%       { box-shadow: 0 0 0 18px rgba(108,62,240,0); }
        }
        @keyframes ytTransLabel {
            0%, 100% { opacity: 0.9; }
            50%       { opacity: 0.35; }
        }
        
        @keyframes ytMonoLine {
            0%   { transform: scaleX(0); opacity: 0; }
            20%  { opacity: 1; }
            80%  { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(1.5); opacity: 0; }
        }
        @keyframes ytMonoText {
            0%, 100% { opacity: 0.2; }
            50%      { opacity: 0.8; }
        }
        
        @keyframes ytNewBadgePulse {
            0%, 100% { opacity: 1;   transform: scale(1);    }
            50%       { opacity: 0.6; transform: scale(1.08); }
        }
        .yt-new-badge {
            display: inline-block;
            background: linear-gradient(135deg, #ff4444 0%, #ff2222 100%);
            color: #fff; font-size: 9px; font-weight: 700;
            padding: 1px 5px; border-radius: 8px;
            margin-left: 6px; vertical-align: middle;
            letter-spacing: 0.06em;
            box-shadow: 0 1px 4px rgba(255,68,68,0.5);
            animation: ytNewBadgePulse 1.6s ease-in-out infinite;
            pointer-events: none; user-select: none;
        }

        @keyframes ytDropdownIn {
            from { opacity: 0; transform: translateX(6px) scale(0.96); }
            to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        #yt-ctrl-dropdown {
            
            background: rgba(18, 18, 18, 0.96);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 6px 0;
            min-width: 110px;
            box-shadow: 0 8px 28px rgba(0,0,0,0.75);
            z-index: 2147483649;
            pointer-events: auto;
            animation: ytDropdownIn 0.15s cubic-bezier(.25,.8,.25,1) forwards;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        #yt-ctrl-dropdown .yt-dd-item {
            display: flex; align-items: center;
            padding: 7px 16px;
            font-size: 13px; font-weight: 500;
            color: rgba(255,255,255,0.82);
            cursor: pointer;
            gap: 8px;
            transition: background 0.1s, color 0.1s;
            white-space: nowrap;
            user-select: none;
        }
        #yt-ctrl-dropdown .yt-dd-item:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        #yt-ctrl-dropdown .yt-dd-item.yt-dd-active {
            color: #3ea6ff;
            font-weight: 700;
        }
        #yt-ctrl-dropdown .yt-dd-item.yt-dd-active::before {
            content: "✔";
            font-size: 11px;
            margin-right: -2px;
        }
        #yt-ctrl-dropdown .yt-dd-label {
            padding: 5px 16px 4px;
            font-size: 10px; font-weight: 700;
            color: rgba(255,255,255,0.38);
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        tp-yt-paper-toast.yt-notification-action-renderer,
        #toast.yt-notification-action-renderer {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    `;
  document.head.appendChild(style);

  const _sfxSize    = Math.max(45, getCfg("ytThumbButtonSize"));
  const _sfxFont    = Math.max(20, getCfg("ytThumbFontSize"));
  const _sfxSpacing = getCfg("ytButtonSpacing");
  const _sfxBtnCSS  = `
    position:fixed; z-index:2147483647;
    width:${_sfxSize}px; height:${_sfxSize}px;
    font-size:${_sfxFont}px;
    background:rgba(0,0,0,0.78); color:#fff; border-radius:50%;
    display:none; align-items:center; justify-content:center;
    cursor:pointer; pointer-events:auto;
    box-shadow:0 2px 10px rgba(0,0,0,0.8);
    transition:transform .12s, background-color .12s;
    user-select:none;
  `;

  const _sfPlay    = document.createElement("div");
  const _sfComment = document.createElement("div");
  _sfPlay.id       = "yt-sfx-play";
  _sfComment.id    = "yt-sfx-comment";
  _sfPlay.textContent    = "▶";
  _sfComment.textContent = "💬";
  _sfPlay.style.cssText    = _sfxBtnCSS;
  _sfComment.style.cssText = _sfxBtnCSS;

  const _sfxHover = (b) => {
    b.addEventListener("mouseenter", () => { b.style.background = "rgba(0,0,0,0.96)"; b.style.transform = "scale(1.12)"; });
    b.addEventListener("mouseleave", () => { b.style.background = "rgba(0,0,0,0.78)"; b.style.transform = "scale(1)"; });
  };
  _sfxHover(_sfPlay);
  _sfxHover(_sfComment);

  [_sfPlay, _sfComment].forEach(b => {
    b.addEventListener("mouseleave", (e) => {
      if (e.relatedTarget === _sfPlay || e.relatedTarget === _sfComment) return;
      _sfxHide();
    });
  });

  document.body.appendChild(_sfPlay);
  document.body.appendChild(_sfComment);

  let _sfxAnchor = null;

  _sfPlay.onclick = (e) => {
    e.stopPropagation();
    if (!_sfxAnchor) return;
    const vid = getID(_sfxAnchor.href);
    if (!vid) return;
    if (persistentOverlay) { showPlayer(persistentOverlay, vid, isShorts(_sfxAnchor.href)); }
    else { persistentOverlay = createPlayer(vid, isShorts(_sfxAnchor.href)); showPlayer(persistentOverlay, vid, isShorts(_sfxAnchor.href)); }
  };
  _sfComment.onclick = (e) => {
    e.stopPropagation();
    if (!_sfxAnchor) return;
    const vid = getID(_sfxAnchor.href);
    if (vid) showComments(vid, isShorts(_sfxAnchor.href));
  };

  function _sfxShow(thumbEl, anchor) {
    _sfxAnchor = anchor;
    const r = thumbEl.getBoundingClientRect();
    _sfPlay.style.top    = (r.top  + 8) + "px";
    _sfPlay.style.left   = (r.left + 8) + "px";
    _sfComment.style.top  = (r.top  + 8) + "px";
    _sfComment.style.left = (r.left + 8 + _sfxSize + _sfxSpacing) + "px";
    _sfPlay.style.display    = "flex";
    _sfComment.style.display = "flex";
  }

  function _sfxHide() {
    _sfPlay.style.display    = "none";
    _sfComment.style.display = "none";
    _sfxAnchor = null;
  }

  function _applySearchForce() {
    const onSearch = window.location.pathname === "/results";
    if (!onSearch) _sfxHide();
  }

  _applySearchForce();
  CleanupManager.addListener(window, "yt-navigate-finish", _applySearchForce);

  CleanupManager.addListener(window, "yt-navigate-finish", () => {
    if (!document.getElementById("yt-master-control-panel")) {
      document.body.classList.remove("yt-panel-open");
    }
  });

  function addButtons(container, anchor) {
    container._sfxAnchor = anchor;

    if (container.dataset.previewReady) {
      const realTimeVid = getID(anchor.href);
      if (realTimeVid && container.dataset.lastVid !== realTimeVid) {
        container.dataset.lastVid = realTimeVid;
        const pBtn = container.querySelector(".yt-preview-play-btn");
        if (pBtn) {
          pBtn.classList.remove("ready", "progressing", "loading");
          pBtn.innerHTML = "▶";
        }
      }
      return;
    }

    container.dataset.previewReady = "1";
    container.classList.add("yt-preview-container");
    container.style.position = "relative";

    const showPlay    = getCfg("ytShowPlayBtn");
    const showComment = getCfg("ytShowCommentBtn");

    const playBtn = showPlay ? document.createElement("div") : null;
    if (playBtn) {
      playBtn.className = "yt-preview-play-btn";
      playBtn.innerHTML = "▶";
    }
    const commentBtn = showComment ? document.createElement("div") : null;
    if (commentBtn) {
      commentBtn.className = "yt-preview-comment-btn";
      commentBtn.innerHTML = "💬";
    }

    const size    = getCfg("ytThumbButtonSize");
    const spacing = getCfg("ytButtonSpacing");

    let btnIndex = 0;
    const nextLeft = () => 8 + btnIndex++ * (size + spacing);

    if (playBtn)    { playBtn.style.top    = "8px"; playBtn.style.left    = nextLeft() + "px"; }
    if (commentBtn) { commentBtn.style.top = "8px"; commentBtn.style.left = nextLeft() + "px"; }

    if (playBtn) {
      playBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const liveAnchor = container._sfxAnchor;
        const clickVid = getID(liveAnchor?.href);
        const clickShorts = isShorts(liveAnchor?.href);
        if (!clickVid) return;
        if (persistentOverlay) {
          showPlayer(persistentOverlay, clickVid, clickShorts);
        } else {
          persistentOverlay = createPlayer(clickVid, clickShorts);
          showPlayer(persistentOverlay, clickVid, clickShorts);
        }
      };
      container.appendChild(playBtn);
    }

    if (commentBtn) {
      commentBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const liveAnchor = container._sfxAnchor;
        const vid = getID(liveAnchor?.href);
        if (vid) showComments(vid, isShorts(liveAnchor?.href));
      };
      container.appendChild(commentBtn);
    }

    const vid = getID(anchor.href);
    if (vid) container.dataset.lastVid = vid;
  }

  function getID(url) {
    if (!url) return null;
    const match = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function isShorts(url) {
    if (!url) return false;
    try { return new URL(url).pathname.startsWith("/shorts/"); }
    catch (_) { return /\/shorts\//.test(url); }
  }

  function buildEmbedUrl(videoId, startMuted = false) {
    return `https://www.youtube.com/shorts/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&theme=dark&autoplay=1${startMuted ? '&mute=1' : ''}`;
  }

  let _activeTransitionDismiss = null;

  function showTransitionOverlay(style, onReady) {
    if (_activeTransitionDismiss) {
      try { _activeTransitionDismiss(false); } catch (_) {}
      _activeTransitionDismiss = null;
    }
    document.getElementById("yt-transition-overlay")?.remove();

    const ov = document.createElement("div");
    ov.id = "yt-transition-overlay";

    const settleDelay = Math.max(400, parseInt(getCfg("ytTransitionDelay")) || 600);

    const MAX_WAIT = 10000;
    let dismissed = false;

    const dismiss = (sendUnmute = true) => {
      if (dismissed) return;
      dismissed = true;
      window.removeEventListener("message", canplayHandler);
      clearTimeout(safeTimer);
      ov.classList.add("fade-out");

      if (sendUnmute) {
        try {
          const iframes = document.querySelectorAll("#yt-preview-popup iframe");
          iframes.forEach(f => {
            f.style.opacity = "1";
            try { f.contentWindow?.postMessage("__YT_UNMUTE__", "*"); } catch (_) {}
          });
        } catch (_) {}
      } else {
         try {
           document.querySelectorAll("#yt-preview-popup iframe").forEach(f => f.style.opacity = "1");
         } catch (_) {}
      }
      setTimeout(() => { ov.remove(); _activeTransitionDismiss = null; onReady?.(); }, 480);
    };

    const canplayHandler = (e) => {
      if (e.data !== "__YT_CANPLAY__") return;
      window.removeEventListener("message", canplayHandler);
      clearTimeout(safeTimer);
      setTimeout(() => dismiss(true), settleDelay);
    };
    window.addEventListener("message", canplayHandler);

    const safeTimer = setTimeout(() => dismiss(true), MAX_WAIT);

    if (style === "scan") {
      ov.style.background = "#000";

      const lines = document.createElement("div");
      lines.style.cssText = `
        position:absolute; inset:0; pointer-events:none;
        background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(62,166,255,0.045) 2px,rgba(62,166,255,0.045) 4px);
        animation: ytScanLines 2.8s linear infinite;
        will-change: transform; 
      `;
      ov.appendChild(lines);

      const corners = document.createElement("div");
      corners.style.cssText = "position:absolute; inset:0; pointer-events:none;";
      const cSize = 28, cThick = 2, cColor = "#3ea6ff", cOff = 24;
      [
        { top: cOff, left: cOff, bt: `${cThick}px 0 0 ${cThick}px` },
        { top: cOff, right: cOff, bt: `${cThick}px ${cThick}px 0 0` },
        { bottom: cOff, left: cOff, bt: `0 0 ${cThick}px ${cThick}px` },
        { bottom: cOff, right: cOff, bt: `0 ${cThick}px ${cThick}px 0` },
      ].forEach(({ top, left, right, bottom, bt }) => {
        const c = document.createElement("div");
        const pos = (top !== undefined ? `top:${top}px;` : `bottom:${bottom}px;`) +
                    (left !== undefined ? `left:${left}px;` : `right:${right}px;`);
        c.style.cssText = `position:absolute;${pos}width:${cSize}px;height:${cSize}px;border:${bt} solid ${cColor};opacity:0.85;`;
        corners.appendChild(c);
      });
      ov.appendChild(corners);

      const bar = document.createElement("div");
      bar.style.cssText = `
        position:absolute; top:0; left:0; right:0; height:2px;
        background: linear-gradient(90deg, transparent 0%, #3ea6ff 40%, rgba(62,166,255,0.35) 70%, transparent 100%);
        box-shadow: 0 0 14px 3px rgba(62,166,255,0.55);
        animation: ytScanBar 2s linear infinite;
        will-change: transform, opacity; 
      `;
      ov.appendChild(bar);

      const ring = document.createElement("div");
      ring.style.cssText = `
        width:80px; height:80px; border-radius:50%;
        border:2px solid #3ea6ff;
        display:flex; align-items:center; justify-content:center;
        position:relative; z-index:2;
        animation: ytScanPulse 2s ease-in-out infinite;
        will-change: transform, box-shadow;
      `;
      ring.innerHTML = `<span style="color:#3ea6ff;font-size:30px;margin-left:4px;">▶</span>`;
      ov.appendChild(ring);

      const label = document.createElement("div");
      label.style.cssText = `
        margin-top:24px; color:#3ea6ff; font-size:12px;
        font-family:monospace; letter-spacing:0.2em; text-transform:uppercase;
        animation: ytScanBlink 1.4s ease-in-out infinite;
        position:relative; z-index:2;
      `;
      label.textContent = txt("status_buffering");
      ov.appendChild(label);

    } else if (style === "burst") {
      ov.style.background = "#0a0a0a";

      const particleWrap = document.createElement("div");
      particleWrap.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
      const COLORS = ["#ff4e4e","#ff8c42","#ffbe5c","#ff6b6b","#ff3333"];
      for (let i = 0; i < 28; i++) {
        const p = document.createElement("div");
        const s = 2 + Math.random() * 4;
        p.style.cssText = `
          position:absolute;
          left:${Math.random()*100}%;
          width:${s}px; height:${s}px;
          border-radius:50%;
          background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
          animation: ytBurstFloat ${2.5 + Math.random()*3}s linear ${-Math.random()*5}s infinite;
        `;
        particleWrap.appendChild(p);
      }
      ov.appendChild(particleWrap);

      const ringWrap = document.createElement("div");
      ringWrap.style.cssText = "position:relative;z-index:2;display:flex;align-items:center;justify-content:center;";
      [0, 0.35, 0.7].forEach((delay, i) => {
        const r = document.createElement("div");
        const sz = 68 + i * 28;
        r.style.cssText = `
          position:absolute;
          width:${sz}px; height:${sz}px; border-radius:50%;
          border:${2 - i*0.3}px solid rgba(255,78,78,${0.7 - i*0.2});
          animation: ytBurstRing ${1.8}s ease-out ${delay}s infinite;
        `;
        ringWrap.appendChild(r);
      });
      const playIcon = document.createElement("div");
      playIcon.style.cssText = `
        width:72px; height:72px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        position:relative; z-index:3;
        animation: ytBurstPlay 1.6s ease-in-out infinite;
      `;
      playIcon.innerHTML = `<span style="color:#ff4e4e;font-size:32px;margin-left:5px;">▶</span>`;
      ringWrap.appendChild(playIcon);
      ov.appendChild(ringWrap);

      const label = document.createElement("div");
      label.style.cssText = `
        margin-top:28px; color:rgba(255,78,78,0.8); font-size:11px;
        font-family:monospace; letter-spacing:0.2em; text-transform:uppercase;
        animation: ytTransLabel 1.4s ease-in-out infinite;
        position:relative; z-index:2;
      `;
      label.textContent = "LOADING";
      ov.appendChild(label);

    } else if (style === "mono") {
      ov.style.background = "#050505";

      const line = document.createElement("div");
      line.style.cssText = `
        position: relative; z-index: 2;
        width: 120px; height: 2px; background: #ffffff;
        animation: ytMonoLine 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
        will-change: transform, opacity;
      `;
      ov.appendChild(line);

      const label = document.createElement("div");
      label.style.cssText = `
        position: absolute; margin-top: 40px;
        color: #ffffff; font-size: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0.4em; text-transform: uppercase;
        animation: ytMonoText 2s ease-in-out infinite;
        will-change: opacity;
      `;
      label.textContent = "LOADING";
      ov.appendChild(label);

    } else {
      ov.style.background = "linear-gradient(135deg,#0d0d1a 0%,#0a0e1e 100%)";

      [
        { s:220, c:"rgba(108,62,240,0.45)", top:"-60px", left:"-40px", dur:"5s", delay:"0s" },
        { s:180, c:"rgba(62,166,255,0.45)", bottom:"-40px", right:"20px", dur:"6s", delay:"-2.5s" },
        { s:120, c:"rgba(168,85,247,0.45)", top:"30%", right:"-20px", dur:"4.5s", delay:"-1s" },
      ].forEach(({ s, c, top, bottom, left, right, dur, delay }) => {
        const orb = document.createElement("div");
        const pos = (top ? `top:${top};` : `bottom:${bottom};`) +
                    (left ? `left:${left};` : `right:${right};`);
        orb.style.cssText = `
          position:absolute; ${pos}
          width:${s}px; height:${s}px; border-radius:50%;
          background: radial-gradient(circle, ${c} 0%, transparent 60%);
          animation: ytOrbFloat ${dur} ease-in-out ${delay} infinite;
          pointer-events:none;
          will-change: transform; 
        `;
        ov.appendChild(orb);
      });

      const glassRing = document.createElement("div");
      glassRing.style.cssText = `
        width:90px; height:90px; border-radius:50%;
        background:rgba(255,255,255,0.07);
        border:1px solid rgba(255,255,255,0.18);
        display:flex; align-items:center; justify-content:center;
        position:relative; z-index:2;
        animation: ytGlassPulse 2.2s ease-in-out infinite;
        will-change: box-shadow;
      `;
      glassRing.innerHTML = `<span style="color:rgba(255,255,255,0.9);font-size:34px;margin-left:5px;position:relative;z-index:3;">▶</span>`;

      const arc = document.createElement("div");
      arc.style.cssText = `
        position:absolute; inset:-8px; border-radius:50%;
        border:2px solid transparent;
        border-top-color:rgba(108,62,240,0.9);
        border-right-color:rgba(62,166,255,0.6);
        animation: ytGlassArc 1.3s linear infinite;
        will-change: transform; 
      `;
      const arc2 = document.createElement("div");
      arc2.style.cssText = `
        position:absolute; inset:-16px; border-radius:50%;
        border:1.5px solid transparent;
        border-bottom-color:rgba(168,85,247,0.6);
        border-left-color:rgba(62,166,255,0.3);
        animation: ytGlassArc 2s linear reverse infinite;
        will-change: transform; 
      `;
      glassRing.appendChild(arc);
      glassRing.appendChild(arc2);
      ov.appendChild(glassRing);

      const label = document.createElement("div");
      label.style.cssText = `
        margin-top:28px; color:rgba(255,255,255,0.45); font-size:11px;
        font-family:monospace; letter-spacing:0.22em; text-transform:uppercase;
        animation: ytTransLabel 1.6s ease-in-out infinite;
        position:relative; z-index:2;
        will-change: opacity;
      `;
      label.textContent = txt("status_initializing");
      ov.appendChild(label);
    }

    document.body.appendChild(ov);
    _activeTransitionDismiss = dismiss;
    return { dismiss };
  }

  function calculatePlayerSize(shorts = false) {
    const opt = SIZE_OPTIONS[currentSizeIndex];
    if (opt.wide === "fit") {
      return shorts
        ? { width: "min(90vw, calc(90vh * 9 / 16))", height: "min(90vh, calc(90vw * 16 / 9))" }
        : { width: "min(90vw, calc(90vh * 16 / 9))", height: "min(90vh, calc(90vw * 9 / 16))" };
    }
    return shorts ? opt.short() : opt.wide();
  }

  function applySize(container, shorts = false) {
    const size = calculatePlayerSize(shorts);
    container.style.width  = size.width;
    container.style.height = size.height;
  }

  function showPlayer(overlay, videoId, shorts = false) {
    if (!overlay || !videoId) return;

    document.body.classList.add("yt-preview-playing");
    _pauseObserver();
    document.querySelectorAll("video").forEach(v => {
      if (v && typeof v.pause === 'function' && !v.closest('#yt-preview-popup')) {
        v.pause();
      }
    });

    overlay.style.cssText = `
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            background: rgba(0,0,0,${getCfg("ytOverlayOpacity")}) !important;
            z-index: 2147483648 !important; display: flex !important;
            justify-content: center !important; align-items: center !important;
            visibility: visible !important; opacity: 1 !important; outline: none;
            pointer-events: auto !important;
        `;

    const iframe = overlay.querySelector("iframe");
    const container = overlay.querySelector("div");

    overlay._isShorts = shorts;
    if (container) applySize(container, shorts);

    if (iframe) {
      const transEnabled = getCfg("ytTransitionEnabled");
      const targetUrl = buildEmbedUrl(videoId, transEnabled);
      const currentSrc = iframe.src;

      if (currentSrc === "about:blank" || !currentSrc.includes(videoId)) {
        overlay._transHandle = null;
        if (transEnabled) {
          const transStyle = getCfg("ytTransitionStyle") || "scan";
          overlay._transHandle = showTransitionOverlay(transStyle, () => {
            overlay._transHandle = null;
          });
        }

        iframe.src = targetUrl;
        if (overlay._watchdogAbort?.signal.aborted) {
          overlay._watchdogAbort = attachIframeWatchdog(iframe, () => {
            try {
              const url = new URL(iframe.src);
              if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
              if (url.pathname.startsWith("/embed/"))  return url.pathname.split("/")[2] || null;
            } catch (_) {}
            return null;
          });
        }
        iframe.onload = () => {
          setTimeout(() => {
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ type: "GET_QUALITY" }),
                "*",
              );
              iframe.contentWindow.postMessage(
                JSON.stringify({ type: "SET_QUALITY", value: "auto" }),
                "*",
              );
            }
          }, 2000);
        };
      } else {
        const post = (func, args = []) => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: func, args: args }),
              "*",
            );
          }
        };
        post("unMute");
        post("setVolume", [100]);
        post("playVideo");
      }
    }

    overlay.focus();
  }

  function hidePlayer(overlay) {
    if (!overlay) return;

    if (overlay._transHandle) {
      try { overlay._transHandle.dismiss(false); } catch (_) {}
      overlay._transHandle = null;
    }

    document.body.classList.remove("yt-preview-playing");
    _resumeObserver();

    overlay._watchdogAbort?.abort();
    const iframe = overlay.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      const post = (func, args = []) => {
        try {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: func, args: args }),
            "*",
          );
        } catch (_) {}
      };
      post("pauseVideo");
      post("mute");
      post("setVolume", [0]);

      setTimeout(() => {
        iframe.src = "about:blank";
      }, 150);
    }
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";
    overlay.style.zIndex = "-9999";
    overlay.style.pointerEvents = "none";
  }

  function attachIframeWatchdog(iframeRef, getCurrentVideoId) {
    const ID = "embedded-youtube-fix";
    let failCount = 0;
    const MAX_FAIL = 5;
    const ref = { el: iframeRef };

    const ping = () => {
      if (ytUserInteracting) return;
      if (!ref.el.contentWindow) return;
      ref.el.contentWindow.postMessage(ID, "https://www.youtube.com");
    };

    const rebuild = () => {
      if (++failCount > MAX_FAIL) return;
      const src = ref.el.src;
      if (!src || src === "about:blank") return;
      console.warn("[YT watchdog] rebuilding iframe");
      const newIframe = ref.el.cloneNode();
      newIframe.src = src;
      ref.el.replaceWith(newIframe);
      ref.el = newIframe;
    };

    const onMessage = (e) => {
      if (e.origin !== "https://www.youtube.com") return;
      if (e.data !== ID) return;
      if (e.source !== ref.el.contentWindow) return;
      rebuild();
    };

    CleanupManager.addListener(window, "message", onMessage);

    const watchdogAbort = new AbortController();
    const { signal: wSignal } = watchdogAbort;

    const timer = setInterval(() => {
      if (wSignal.aborted) { clearInterval(timer); return; }
      ping();
    }, 2000);
    CleanupManager.addTimer(timer);

    wSignal.addEventListener('abort', () => {
      clearInterval(timer);
      const idx = CleanupManager.timers.indexOf(timer);
      if (idx !== -1) CleanupManager.timers.splice(idx, 1);
    }, { once: true });

    return watchdogAbort;
  }

  function createPlayer(videoId, shorts = false) {
    if (persistentOverlay) return persistentOverlay;

    const opacity = getCfg("ytOverlayOpacity");
    const overlay = document.createElement("div");
    overlay.id = "yt-preview-popup";
    overlay._isShorts = shorts;
    overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,${opacity});z-index:2147483648;
            display:flex;justify-content:center;align-items:center;
            outline:none;visibility:hidden;
        `;

    overlay.onclick = (e) => {
      if (e.target === overlay) hidePlayer(overlay);
    };
    overlay.onkeydown = (e) => {
      if (e.key === "Escape") hidePlayer(overlay);
      if (e.key === " ") e.stopPropagation();
    };

    const preCalculatedSize = calculatePlayerSize(shorts);
    const container = document.createElement("div");
    container.style.cssText = `
            position:relative;
            width:${preCalculatedSize.width};
            height:${preCalculatedSize.height};
            overflow:visible;
            box-shadow:0 0 50px rgba(0,0,0,0.8);
        `;

    const playerDiv = document.createElement("div");
    playerDiv.style.cssText = `
            position:absolute; top:0; left:0;
            width:100%; height:100%;
            overflow:hidden; border-radius:12px;
        `;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
    position:absolute;top:0;left:0;
    width:100%;height:100%;border:none;
`;
    iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write";
    iframe.loading = "eager";
    iframe.src = "about:blank";

    const _watchdogAbort = attachIframeWatchdog(iframe, () => {
      try {
        const url = new URL(iframe.src);
        if (url.pathname.startsWith("/shorts/")) {
          return url.pathname.split("/")[2] || null;
        }
        if (url.pathname.startsWith("/embed/")) {
          return url.pathname.split("/")[2] || null;
        }
      } catch (e) {}
      return null;
    });
    overlay._watchdogAbort = _watchdogAbort;

    const controls = document.createElement("div");
    controls.id = "yt-p-controls";
    const btnStyle = `
            font-size:${getCfg("ytPopupSymbolSize")}px;
            cursor:pointer;
            opacity:${getCfg("ytPopupSymbolOpacity")};
            color:#fff;
            text-shadow:0 1px 4px #000;
            font-weight:bold;
            text-align:center;
            min-width:40px;
        `;

    const topPos = Math.max(10, getCfg("ytPopupButtonOffset") - 30);
    controls.style.cssText = `
            position:absolute; top:${topPos}px; right:15px;
            display:flex; flex-direction:column; gap:15px; z-index:30;
            opacity:0; transition:opacity .3s;
            pointer-events:auto;
        `;

    const _mkBtn = (id, titleKey, text, extraTitle = "") => {
      const el = document.createElement("div");
      el.id = id;
      el.title = txt(titleKey) + extraTitle;
      el.textContent = text;
      el.style.cssText = btnStyle;
      return el;
    };
    controls.appendChild(_mkBtn("closeBtn",  "close",  "✖"));
    controls.appendChild(_mkBtn("resizeBtn", "resize", "⛶", `: ${SIZE_OPTIONS[currentSizeIndex].name}`));
    controls.appendChild(_mkBtn("speedBtn",  "speed",  "1x"));
    controls.appendChild(_mkBtn("qualityBtn","quality","HD"));

    const dropdown = document.createElement("div");
    dropdown.id = "yt-ctrl-dropdown";
    dropdown.style.display = "none";
    container.appendChild(dropdown);

    const sendToIframe = (type, value) => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ type, value }), "*");
      }
    };

    let _ddCloseHandler = null;

    const showDropdown = (anchorBtn, label, items, onSelect) => {
      if (dropdown.style.display !== "none" && dropdown._anchor === anchorBtn) {
        dropdown.style.display = "none";
        dropdown._anchor = null;
        return;
      }
      dropdown._anchor = anchorBtn;

      dropdown.innerHTML = "";
      if (label) {
        const lbl = document.createElement("div");
        lbl.className = "yt-dd-label";
        lbl.textContent = label;
        dropdown.appendChild(lbl);
      }
      items.forEach(({ text, value, active }) => {
        const item = document.createElement("div");
        item.className = "yt-dd-item" + (active ? " yt-dd-active" : "");
        item.textContent = text;
        item.onclick = (ev) => {
          ev.stopPropagation();
          dropdown.style.display = "none";
          dropdown._anchor = null;
          onSelect(value);
        };
        dropdown.appendChild(item);
      });

      dropdown.style.cssText = "display:block; position:fixed; z-index:2147483649;";
      const btnRect = anchorBtn.getBoundingClientRect();
      const ddW = dropdown.offsetWidth  || 130;
      const ddH = dropdown.offsetHeight || 40;
      const gap = 8;
      let left = btnRect.left - ddW - gap;
      let top  = btnRect.top + btnRect.height / 2 - ddH / 2;
      top  = Math.max(8, Math.min(top, window.innerHeight - ddH - 8));
      left = Math.max(8, left);
      dropdown.style.left = left + "px";
      dropdown.style.top  = top  + "px";

      if (_ddCloseHandler) document.removeEventListener("click", _ddCloseHandler, true);
      _ddCloseHandler = (ev) => {
        if (!dropdown.contains(ev.target) && ev.target !== anchorBtn) {
          dropdown.style.display = "none";
          dropdown._anchor = null;
          document.removeEventListener("click", _ddCloseHandler, true);
          _ddCloseHandler = null;
        }
      };
      setTimeout(() => document.addEventListener("click", _ddCloseHandler, true), 0);
    };

    const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    let currentSpeed = 1;
    const speedBtn = controls.querySelector("#speedBtn");
    speedBtn.onclick = (e) => {
      e.stopPropagation();
      showDropdown(
        speedBtn,
        txt("speed"),
        SPEEDS.map(s => ({ text: s === 1 ? `${s}x  (${txt("speed").replace(/速|Speed|速度|속도|Vitesse|Velocidade|Velocidad/i,"").trim()} Normal)`.replace(/\s+/," ").trim() : s + "x", value: s, active: s === currentSpeed })),
        (val) => {
          currentSpeed = val;
          sendToIframe("SET_SPEED", val);
          speedBtn.textContent = val + "x";
        }
      );
    };

    let availableLevels = [];
    const qualityBtn = controls.querySelector("#qualityBtn");
    const qMap = {
      hd2160: "4K", hd1440: "2K", hd1080: "1080p",
      hd720: "720p", large: "480p", medium: "360p", small: "240p", tiny: "144p", auto: "Auto",
    };

    if (messageListener) {
      CleanupManager.removeListener(window, "message", messageListener);
    }

    messageListener = (e) => {
      try {
        const jsonData = JSON.parse(e.data);
        if (jsonData.type === "QUALITY_LIST") {
          availableLevels = jsonData.levels;
          const cur = jsonData.current;
          qualityBtn.textContent = qMap[cur] || "HD";
          qualityBtn.dataset.current = cur;
        }
      } catch (_) {}
    };
    CleanupManager.addListener(window, "message", messageListener);

    qualityBtn.onclick = (e) => {
      e.stopPropagation();
      if (availableLevels.length === 0) {
        if (qualityBtn._waitingQuality) return;
        qualityBtn._waitingQuality = true;
        sendToIframe("GET_QUALITY");
        qualityBtn.textContent = "…";
        const waitQuality = (ev) => {
          try {
            const d = JSON.parse(ev.data);
            if (d.type === "QUALITY_LIST") {
              CleanupManager.removeListener(window, "message", waitQuality);
              clearTimeout(waitQualityTimer);
              qualityBtn._waitingQuality = false;
              qualityBtn.click();
            }
          } catch (_) {}
        };
        CleanupManager.addListener(window, "message", waitQuality);
        const waitQualityTimer = setTimeout(() => {
          CleanupManager.removeListener(window, "message", waitQuality);
          qualityBtn._waitingQuality = false;
        }, 4000);
        return;
      }
      const cur = qualityBtn.dataset.current || availableLevels[0];
      showDropdown(
        qualityBtn,
        txt("quality"),
        availableLevels.map(lv => ({
          text: qMap[lv] || lv.replace("hd","").toUpperCase() + "p",
          value: lv,
          active: lv === cur,
        })),
        (val) => {
          sendToIframe("SET_QUALITY", val);
          qualityBtn.dataset.current = val;
          qualityBtn.textContent = qMap[val] || val.replace("hd","").toUpperCase();
        }
      );
    };

    controls.querySelector("#resizeBtn").onclick = (e) => {
      e.stopPropagation();
      showDropdown(
        controls.querySelector("#resizeBtn"),
        txt("resize"),
        SIZE_OPTIONS.map((opt, i) => ({ text: opt.name, value: i, active: i === currentSizeIndex })),
        (val) => {
          currentSizeIndex = val;
          GM_setValue("ytPlayerSizeIndex", currentSizeIndex);
          applySize(container, overlay._isShorts ?? false);
          controls.querySelector("#resizeBtn").title = `${txt("resize")}: ${SIZE_OPTIONS[currentSizeIndex].name}`;
        }
      );
    };

    controls.style.opacity = "0";
    container.addEventListener("mouseenter", () => { controls.style.opacity = "1"; });
    container.addEventListener("mouseleave", () => { controls.style.opacity = "0"; });
    controls.addEventListener("mouseenter",  () => { controls.style.opacity = "1"; });

    const closeBtn = controls.querySelector("#closeBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        hidePlayer(overlay);
      });
    }

    container.addEventListener("mouseenter", () => { ytUserInteracting = true;  });
    container.addEventListener("mouseleave", () => { ytUserInteracting = false; });

    playerDiv.appendChild(iframe);
    container.appendChild(playerDiv);
    container.appendChild(controls);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    persistentOverlay = overlay;
    return overlay;
  }

  const NEW_FEATURES = [
    { id: "feat_transition_style", elementId: "ytTransitionStyle" },
  ];

  const _getSeenFeatures = () => {
    try { return new Set(JSON.parse(GM_getValue("ytSeenFeatures", "[]"))); }
    catch (_) { return new Set(); }
  };
  const _markFeatureSeen = (id) => {
    const seen = _getSeenFeatures();
    if (seen.has(id)) return;
    seen.add(id);
    GM_setValue("ytSeenFeatures", JSON.stringify([...seen]));
  };

  function _applyNewBadges(panel) {
    const seen = _getSeenFeatures();
    NEW_FEATURES.forEach(({ id, elementId }) => {
      if (seen.has(id)) return;
      const el = panel.querySelector(`#${elementId}`);
      if (!el) return;

      const label = el.closest("label") || el.parentElement;
      if (!label) return;

      const badge = document.createElement("span");
      badge.className = "yt-new-badge";
      badge.dataset.newBadge = id;
      badge.textContent = "NEW";

      label.insertBefore(badge, el);

      const dismiss = () => {
        badge.remove();
        _markFeatureSeen(id);
      };
      el.addEventListener("change", dismiss, { once: true });
      el.addEventListener("input",  dismiss, { once: true });
      el.addEventListener("click",  dismiss, { once: true });
    });
  }

  function createControlPanel() {
    document.getElementById("yt-master-control-panel")?.remove();
    const p = document.createElement("div");
    p.id = "yt-master-control-panel";

    document.body.classList.add("yt-panel-open");

    const RESET_BTN = (k) =>
      `<button type="button" data-reset="${k}" title="Reset" style="
        flex-shrink:0;background:none;border:1px solid #555;color:#888;
        border-radius:3px;padding:0 5px;font-size:10px;cursor:pointer;
        line-height:1.6;margin-left:4px;">↺</button>`;

    const mkRange = (lbl, k, min, max) => `
      <div class="yt-cp-row">
        <span class="yt-cp-lbl">${lbl}</span>
        <div class="yt-cp-ctrl">
          <input type="range" id="${k}" min="${min}" max="${max}"
                 value="${getCfg(k)}" step="${max <= 1 ? 0.1 : 1}"
                 style="flex:1;min-width:0;">
          <span id="d_${k}" style="width:34px;text-align:right;flex-shrink:0;font-size:12px;">
            ${getCfg(k)}
          </span>
          ${RESET_BTN(k)}
        </div>
      </div>`;

    const mkCheck = (lbl, k) => `
      <div class="yt-cp-row" style="align-items:center;">
        <span class="yt-cp-lbl">${lbl}</span>
        <div class="yt-cp-ctrl" style="justify-content:flex-start;gap:8px;">
          <input type="checkbox" id="${k}" ${getCfg(k) ? "checked" : ""}>
          ${RESET_BTN(k)}
        </div>
      </div>`;

    const mkSelect = (lbl, k, opts) => `
      <div class="yt-cp-row" style="align-items:center;">
        <span class="yt-cp-lbl">${lbl}</span>
        <div class="yt-cp-ctrl" style="justify-content:flex-start;gap:6px;">
          <select id="${k}" style="background:#333;color:white;border:1px solid #555;border-radius:4px;padding:2px 6px;flex:1;min-width:0;">
            ${opts}
          </select>
          ${RESET_BTN(k)}
        </div>
      </div>`;

    p.innerHTML = `
      <style>
        #yt-master-control-panel .yt-cp-section {
          font-size:11px;color:#888;margin:14px 0 8px;
          padding-top:10px;border-top:1px solid #383838;
          letter-spacing:0.04em;text-transform:uppercase;
        }
        #yt-master-control-panel .yt-cp-row {
          display:grid;grid-template-columns:1fr 1fr;
          gap:6px;align-items:center;margin-bottom:7px;
        }
        #yt-master-control-panel .yt-cp-lbl {
          font-size:12px;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        #yt-master-control-panel .yt-cp-ctrl {
          display:flex;align-items:center;gap:4px;
        }
        #yt-master-control-panel button[data-reset]:hover { color:#fff;border-color:#aaa; }
      </style>

      <h3 style="margin:0 0 12px;color:#3ea6ff;border-bottom:1px solid #444;padding-bottom:10px;">
        ${txt("panel_title")}
      </h3>

      <!-- 語言 -->
      ${mkSelect("🌐 Language", "ytLanguage",
          SUPPORTED_LANGS.map(code =>
            `<option value="${code}" ${getCfg("ytLanguage") === code ? "selected" : ""}>${LANG_FLAGS[code] || "🌐"} ${LANG_LABELS[code] || code}</option>`
          ).join("")
      )}

      <!-- 按鈕設定 -->
      <div class="yt-cp-section">${txt("btn_settings")}</div>
      ${mkRange(txt("size"),    "ytThumbButtonSize", 16, 50)}
      ${mkRange(txt("font"),    "ytThumbFontSize",   10, 30)}
      ${mkRange(txt("opacity"), "ytThumbOpacity",    0.1, 1)}
      <div style="font-size:10px;color:#555;margin:-4px 0 8px;">${txt("refresh_note")}</div>
      ${mkRange(txt("spacing"), "ytButtonSpacing", 0, 50)}
      ${mkCheck(txt("always_visible"),  "ytButtonsAlwaysVisible")}
      ${mkCheck(txt("show_play_btn"),   "ytShowPlayBtn")}
      ${mkCheck(txt("show_comment_btn"),"ytShowCommentBtn")}

      <!-- 播放器設定 -->
      <div class="yt-cp-section">${txt("player_settings")}</div>
      <div style="font-size:11px;color:#666;margin-bottom:8px;">${txt("player_side_hint")}</div>
      ${mkRange(txt("bg_density"),   "ytOverlayOpacity",     0.1, 1)}
      ${mkRange(txt("v_pos"),        "ytPopupButtonOffset",  0, 200)}
      ${mkRange(txt("icon_size"),    "ytPopupSymbolSize",    10, 50)}
      ${mkRange(txt("icon_opacity"), "ytPopupSymbolOpacity", 0.1, 1)}

      <!-- 過渡動畫 -->
      <div class="yt-cp-section">🎬 ${txt("transition_anim")}</div>
      ${mkCheck(txt("transition_anim"), "ytTransitionEnabled")}
      <div id="yt-trans-style-row" style="${getCfg("ytTransitionEnabled") ? "" : "opacity:0.4;pointer-events:none;"}">
        ${mkSelect(`${txt("transition_style")}
          <span style="background:rgba(255,180,0,0.18);color:#ffb400;font-size:9px;font-weight:700;
            padding:1px 5px;border-radius:8px;border:1px solid rgba(255,180,0,0.35);
            vertical-align:middle;letter-spacing:0.04em;">⚠️ Exp</span>`,
          "ytTransitionStyle", `
          <option value="scan"  ${getCfg("ytTransitionStyle") === "scan"  ? "selected" : ""}>🔵 ${txt("ts_scan")}</option>
          <option value="burst" ${getCfg("ytTransitionStyle") === "burst" ? "selected" : ""}>🔴 ${txt("ts_burst")}</option>
          <option value="glass" ${getCfg("ytTransitionStyle") === "glass" ? "selected" : ""}>🟣 ${txt("ts_glass")}</option>
          <option value="mono"  ${getCfg("ytTransitionStyle") === "mono"  ? "selected" : ""}>⚪ ${txt("ts_mono")}</option>
        `)}
      </div>
      <div id="yt-trans-delay-row" style="${getCfg("ytTransitionEnabled") ? "" : "opacity:0.4;pointer-events:none;"}">
        ${mkRange(txt("transition_delay"), "ytTransitionDelay", 400, 1500)}
      </div>

      <!-- 底部按鈕 -->
      <div style="text-align:right;margin-top:16px;padding-top:12px;border-top:1px solid #383838;">
        <button id="yt-reset" style="background:#555;color:white;border:none;padding:6px 12px;border-radius:4px;margin-right:8px;cursor:pointer;">
          ${txt("reset")}
        </button>
        <button id="yt-save" style="background:#3ea6ff;color:black;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-weight:bold;">
          ${txt("save")}
        </button>
      </div>
      <button id="yt-close" style="position:absolute;top:10px;right:10px;background:none;border:none;color:#aaa;font-size:18px;cursor:pointer;">✖</button>
    `;
    document.body.appendChild(p);
    _applyNewBadges(p);

    const applyRealTime = (k, v) => {
      const d = document.getElementById("d_" + k);
      if (d) d.textContent = v;

      if (["ytThumbButtonSize", "ytThumbFontSize", "ytThumbOpacity"].includes(k)) {
        document.querySelectorAll(".yt-preview-play-btn, .yt-preview-comment-btn").forEach(btn => {
          if (k === "ytThumbButtonSize") { btn.style.width = v + "px"; btn.style.height = v + "px"; }
          if (k === "ytThumbFontSize")   btn.style.fontSize = v + "px";
          if (k === "ytThumbOpacity")    btn.style.backgroundColor = `rgba(0,0,0,${v})`;
        });
      }

      const popup = document.getElementById("yt-preview-popup");
      if (popup) {
        if (k === "ytOverlayOpacity") popup.style.background = `rgba(0,0,0,${v})`;
        const ctrl = popup.querySelector("#yt-p-controls");
        if (ctrl) {
          if (k === "ytPopupButtonOffset") ctrl.style.top = Math.max(10, v - 30) + "px";
          if (k === "ytPopupSymbolSize")   ctrl.querySelectorAll("div").forEach(d => d.style.fontSize   = v + "px");
          if (k === "ytPopupSymbolOpacity") ctrl.querySelectorAll("div").forEach(d => d.style.opacity = v);
        }
      }

      const mini = document.getElementById("yt-mini-player");
      if (mini) {
        if (k === "ytOverlayOpacity") mini.style.background = `rgba(0,0,0,${v})`;
      }
    };

    p.querySelectorAll("input[type=range]").forEach(i => {
      i.addEventListener("input", () => applyRealTime(i.id, i.value));
    });

    p.querySelectorAll("button[data-reset]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const k = btn.dataset.reset;
        const def = DEFAULTS[k];
        if (def === undefined) return;
        const el = document.getElementById(k);
        if (!el) return;
        if (el.type === "checkbox") {
          el.checked = def;
        } else if (el.type === "range") {
          el.value = def;
          applyRealTime(k, def);
        } else {
          el.value = def;
        }
      });
    });

    const transCheck = document.getElementById("ytTransitionEnabled");
    const transStyleRow = document.getElementById("yt-trans-style-row");
    const transDelayRow = document.getElementById("yt-trans-delay-row");
    if (transCheck) {
      const syncTransRow = () => {
        const on = transCheck.checked;
        [transStyleRow, transDelayRow].forEach(row => {
          if (!row) return;
          row.style.opacity = on ? "1" : "0.4";
          row.style.pointerEvents = on ? "auto" : "none";
        });
      };
      transCheck.addEventListener("change", syncTransRow);
    }

    const langSelect = document.getElementById("ytLanguage");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        const targetLang = e.target.value;
        if (targetLang === currentLang) return;

        for (let k in DEFAULTS) {
          if (["yt_comment_api_key", "ytPlayerSizeIndex", "ytLanguage"].includes(k)) continue;
          const el = document.getElementById(k);
          if (el) {
            GM_setValue(
              k,
              el.type === "checkbox" ? el.checked
                : el.type === "range" ? parseFloat(el.value)
                : el.value,
            );
          }
        }

        showLangSwitchDialog(
          targetLang,
          
          () => {},
          
          () => { langSelect.value = currentLang; },
        );
      });
    }

    p.querySelector("#yt-close").onclick = (e) => {
      e.stopPropagation();
      document.body.classList.remove("yt-panel-open");
      p.remove();
    };

    p.querySelector("#yt-reset").onclick = (e) => {
      e.stopPropagation();
      if (confirm(txt("confirm_reset"))) {
        for (let k in DEFAULTS) GM_setValue(k, DEFAULTS[k]);
        location.reload();
      }
    };

    p.querySelector("#yt-save").onclick = async (e) => {
      e.stopPropagation();

      const saveBtn = p.querySelector("#yt-save");
      saveBtn.disabled = true;
      saveBtn.textContent = "⏳ ...";
      saveBtn.style.opacity = "0.7";

      const writes = [];
      for (let k in DEFAULTS) {
        if (["yt_comment_api_key", "ytPlayerSizeIndex", "ytLanguage"].includes(k)) continue;
        const el = document.getElementById(k);
        if (el) {
          const val = el.type === "checkbox" ? el.checked
                    : el.type === "range"    ? parseFloat(el.value)
                    : el.value;
          writes.push(Promise.resolve(GM_setValue(k, val)));
        }
      }
      const tsEl = document.getElementById("ytTransitionStyle");
      if (tsEl) writes.push(Promise.resolve(GM_setValue("ytTransitionStyle", tsEl.value)));

      await Promise.all(writes);

      saveBtn.textContent = txt("save_done");
      saveBtn.style.background = "#22bb55";
      saveBtn.style.opacity = "1";

      let countdown = 2;
      const countEl = document.createElement("span");
      countEl.style.cssText = "font-size:11px;color:#aaa;margin-left:8px;";
      countEl.textContent = txtF("save_countdown", { n: countdown });
      saveBtn.after(countEl);

      const tick = setInterval(() => {
        countdown--;
        countEl.textContent = txtF("save_countdown", { n: countdown });
        if (countdown <= 0) {
          clearInterval(tick);
          window.location.reload();
        }
      }, 1000);
    };
  }

  let _miniPlayerDragAbort = null;

  function showMiniPlayer(videoId) {
    const MINI_ID = "yt-mini-player";

    const existing = document.getElementById(MINI_ID);
    if (existing) {
      if (existing.dataset.vid === videoId) return;
      existing.querySelector("iframe").src = "about:blank";
      if (_miniPlayerDragAbort) {
        _miniPlayerDragAbort.abort();
        _miniPlayerDragAbort = null;
      }
      existing.remove();
    }

    const mini = document.createElement("div");
    mini.id = MINI_ID;
    mini.dataset.vid = videoId;
    mini.style.cssText = `
      position: fixed; top: 70px; right: 20px;
      width: 320px; height: 180px;
      background: transparent; border: 2px solid #555;
      border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.8);
      z-index: 2147483647; overflow: hidden;
      transition: box-shadow 0.15s;
    `;

    const handle = document.createElement("div");
    handle.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 32px;
      background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px; cursor: grab; user-select: none;
      opacity: 0; transition: opacity 0.2s; z-index: 10;
    `;
    mini.addEventListener("mouseenter", () => { handle.style.opacity = "1"; });
    mini.addEventListener("mouseleave", () => { if (!isDragging) handle.style.opacity = "0"; });

    const handleLeft = document.createElement("span");
    handleLeft.style.cssText = "display:flex; align-items:center; flex:1; min-width:0;";

    const gripIcon = document.createElement("span");
    gripIcon.textContent = "⠿⠿";
    gripIcon.style.cssText = "letter-spacing:2px; color:#555; font-size:10px; flex-shrink:0;";

    handleLeft.appendChild(gripIcon);

    const rightBtns = document.createElement("div");
    rightBtns.style.cssText = "display:flex; align-items:center; gap:4px; flex-shrink:0;";

    const btnBaseCSS = `
      color: #888; font-size: 13px; cursor: pointer; padding: 2px 5px;
      border-radius: 4px; line-height: 1; flex-shrink: 0;
      transition: color 0.15s, background 0.15s; user-select: none;
    `;

    const copyBtn = document.createElement("div");
    copyBtn.title = txt("copy_url");
    copyBtn.style.cssText = btnBaseCSS + "display:flex; align-items:center; justify-content:center; width:20px; height:20px;";
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 底層文件（後面那張）-->
      <rect x="8" y="8" width="13" height="13" rx="2"/>
      <!-- 上層文件（前面那張，左上角缺角折頁效果）-->
      <path d="M3 16V5a2 2 0 0 1 2-2h9"/>
    </svg>`;
    copyBtn.onmouseenter = () => { copyBtn.style.color = "#fff"; copyBtn.style.background = "rgba(62,166,255,0.3)"; };
    copyBtn.onmouseleave = () => { copyBtn.style.color = "#888"; copyBtn.style.background = "transparent"; };
    const svgSnapshot = copyBtn.innerHTML;
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.innerHTML = "✓";
        copyBtn.style.color = "#4caf50";
        setTimeout(() => { copyBtn.innerHTML = svgSnapshot; copyBtn.style.color = "#888"; }, 1500);
      }).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy");
        ta.remove();
        copyBtn.innerHTML = "✓";
        copyBtn.style.color = "#4caf50";
        setTimeout(() => { copyBtn.innerHTML = svgSnapshot; copyBtn.style.color = "#888"; }, 1500);
      });
    };

    const closeBtn = document.createElement("div");
    closeBtn.textContent = "✖";
    closeBtn.style.cssText = btnBaseCSS;
    closeBtn.onmouseenter = () => { closeBtn.style.color = "#fff"; closeBtn.style.background = "rgba(200,0,0,0.7)"; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = "#888"; closeBtn.style.background = "transparent"; };
    const dragAbort = new AbortController();
    const { signal } = dragAbort;
    _miniPlayerDragAbort = dragAbort;
    let isDragging = false, ox = 0, oy = 0;

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      mini.querySelector("iframe").src = "about:blank";
      dragAbort.abort();
      _miniPlayerDragAbort = null;
      mini.remove();
    };

    rightBtns.appendChild(copyBtn);

    rightBtns.appendChild(closeBtn);

    handle.appendChild(handleLeft);
    handle.appendChild(rightBtns);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
        position:absolute;top:0;left:0;
        width:100%;height:100%;border:none;
        opacity: 0; transition: opacity 0.4s ease;
    `;
    iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write";

    iframe.src = buildEmbedUrl(videoId, false);
    iframe.onload = () => {
      iframe.style.opacity = "1";
    };

    mini.appendChild(iframe);
    mini.appendChild(handle);
    document.body.appendChild(mini);

    handle.addEventListener("mousedown", (e) => {
      if (rightBtns.contains(e.target)) return;
      isDragging = true;
      const r = mini.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      handle.style.cursor = "grabbing";
      mini.style.boxShadow = "0 8px 32px rgba(0,0,0,0.95)";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const maxX = window.innerWidth  - mini.offsetWidth;
      const maxY = window.innerHeight - mini.offsetHeight;
      mini.style.left  = Math.min(maxX, Math.max(0, e.clientX - ox)) + "px";
      mini.style.top   = Math.min(maxY, Math.max(0, e.clientY - oy)) + "px";
      mini.style.right = "auto";
    }, { signal });

    document.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      handle.style.cursor = "grab";
      mini.style.boxShadow = "0 4px 24px rgba(0,0,0,0.8)";
      if (!mini.matches(":hover")) handle.style.opacity = "0";
    }, { signal });

    window.addEventListener("beforeunload", () => dragAbort.abort(), { signal, once: true });
  }

  (function installBodyReplaceGuard() {
    const htmlEl = document.documentElement;
    if (!htmlEl) return;

    const bodyGuardObserver = new MutationObserver(() => {
      const mini = document.getElementById("yt-mini-player");
      if (mini && !document.body.contains(mini)) {
        document.body.appendChild(mini);
        console.log("🔄 yt-mini-player re-attached after body replacement");
      }
    });
    CleanupManager.addObserver(bodyGuardObserver);
    bodyGuardObserver.observe(htmlEl, { childList: true });
  })();

  function showComments(videoId, shorts = false) {
    if (!API_KEY) {
      showApiKeyPrompt(videoId);
      return;
    }

    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    document.getElementById("yt-comment-overlay")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "yt-comment-overlay";
    overlay.style.cssText = `
          position:fixed; top:0; left:0; width:100vw; height:100vh;
          background:rgba(0,0,0,0.85); z-index:999999;
          display:flex; justify-content:center; align-items:center; outline:none;
      `;

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        if (currentAbortController) currentAbortController.abort();
        overlay.remove();
      }
    };

    const box = document.createElement("div");
    box.id = "yt-comment-box";
    box.style.cssText = `
          width:min(90vw, 800px); min-height:200px; max-height:90vh;
          background:#181818; color:#fff; font-size:16px; padding:16px;
          overflow-y:auto; border-radius:12px;
          box-shadow:0 0 40px rgba(0,0,0,0.8);
          display:flex; flex-direction:column;
      `;
    box.onclick = (e) => e.stopPropagation();

    const topBar = document.createElement("div");
    topBar.style.cssText = `
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:12px; flex-wrap:wrap; gap:8px;
      `;

    const controls = document.createElement("div");
    controls.style.cssText = `
          display:flex; align-items:center; gap:8px; font-size:14px;
          flex-grow:1; flex-wrap:wrap;
      `;

    const _mkLabel = (textKey, child) => {
      const lbl = document.createElement("label");
      lbl.appendChild(document.createTextNode(txt(textKey) + " "));
      lbl.appendChild(child);
      return lbl;
    };
    const _mkSelect = (id) => {
      const sel = document.createElement("select");
      sel.id = id;
      sel.className = "common-control";
      return sel;
    };
    const _mkOpt = (value, text) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = text;
      return opt;
    };
    const _mkOptGroup = (label, entries) => {
      const grp = document.createElement("optgroup");
      grp.label = label;
      entries.forEach(([v, t]) => grp.appendChild(_mkOpt(v, t)));
      return grp;
    };

    const orderSel = _mkSelect("c_order");
    orderSel.appendChild(_mkOpt("relevance", txt("c_relevance")));
    orderSel.appendChild(_mkOpt("time",      txt("c_time")));
    controls.appendChild(_mkLabel("c_sort", orderSel));

    const countSel = _mkSelect("c_count");
    [100, 300, 500, 800].forEach(n => countSel.appendChild(_mkOpt(String(n), String(n))));
    controls.appendChild(_mkLabel("c_count", countSel));

    const langSel = _mkSelect("c_lang");
    langSel.appendChild(_mkOpt("", txt("c_trans")));
    langSel.appendChild(_mkOptGroup("── East Asia ──",        [["zh-TW","繁體中文"],["zh-CN","简体中文"],["ja","日本語"],["ko","한국어"],["mn","Монгол"]]));
    langSel.appendChild(_mkOptGroup("── Southeast Asia ──",   [["th","ภาษาไทย"],["vi","Tiếng Việt"],["id","Bahasa Indonesia"],["ms","Bahasa Melayu"],["tl","Filipino"],["km","ភាសាខ្មែរ"],["lo","ພາສາລາວ"],["my","မြန်မာဘာသာ"]]));
    langSel.appendChild(_mkOptGroup("── South Asia ──",       [["hi","हिन्दी"],["bn","বাংলা"],["ur","اردو"],["ne","नेपाली"],["si","සිංහල"]]));
    langSel.appendChild(_mkOptGroup("── Western Europe ──",   [["en","English"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["it","Italiano"],["nl","Nederlands"],["ca","Català"]]));
    langSel.appendChild(_mkOptGroup("── Northern Europe ──",  [["sv","Svenska"],["no","Norsk"],["da","Dansk"],["fi","Suomi"],["is","Íslenska"]]));
    langSel.appendChild(_mkOptGroup("── Eastern Europe ──",   [["ru","Русский"],["uk","Українська"],["pl","Polski"],["cs","Čeština"],["sk","Slovenčina"],["hu","Magyar"],["ro","Română"],["bg","Български"],["hr","Hrvatski"],["sr","Српски"],["sl","Slovenščina"],["lt","Lietuvių"],["lv","Latviešu"],["et","Eesti"],["mk","Македонски"],["sq","Shqip"],["mt","Malti"]]));
    langSel.appendChild(_mkOptGroup("── Southern Europe ──",  [["el","Ελληνικά"]]));
    langSel.appendChild(_mkOptGroup("── Middle East / West Asia ──", [["ar","العربية"],["he","עברית"],["fa","فارسی"],["tr","Türkçe"],["az","Azərbaycan"],["ka","ქართული"],["hy","Հայերեն"]]));
    langSel.appendChild(_mkOptGroup("── Central Asia ──",     [["kk","Қазақша"],["uz","Oʻzbekcha"]]));
    langSel.appendChild(_mkOptGroup("── Africa ──",           [["sw","Kiswahili"],["af","Afrikaans"],["am","አማርኛ"],["yo","Yorùbá"],["ha","Hausa"],["zu","isiZulu"]]));
    const langLabel = document.createElement("label");
    langLabel.appendChild(document.createTextNode("🌐 "));
    langLabel.appendChild(langSel);
    controls.appendChild(langLabel);

    const searchInput = document.createElement("input");
    searchInput.id = "c_search";
    searchInput.type = "text";
    searchInput.placeholder = txt("c_search");
    searchInput.className = "common-control";
    searchInput.style.width = "120px";
    controls.appendChild(searchInput);
    prependTopLangs(controls.querySelector("#c_lang"));

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "8px";

    const playBtn = document.createElement("button");
    playBtn.className = "yt-comment-btn-hover";
    playBtn.innerHTML = txt("mini_play");
    playBtn.style.cssText = `
          font-size:14px; border:none; background:#3ea6ff; color:#000;
          padding:4px 12px; border-radius:4px; cursor:pointer;
          font-weight:bold; transition:0.2s;
      `;
    playBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      showMiniPlayer(videoId);
    };

    const apiBtn = document.createElement("button");
    apiBtn.className = "yt-comment-btn-hover";
    apiBtn.innerHTML = txt("c_api");
    apiBtn.style.cssText = `
          font-size:14px; border:none; background:#333; color:#fff;
          padding:4px 8px; border-radius:4px; cursor:pointer; transition:0.2s;
      `;
    apiBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      showApiKeyPrompt(videoId);
    };

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✖";
    closeBtn.style.cssText = `
          font-size:18px; border:none; background:transparent;
          color:#aaa; cursor:pointer; margin-left:8px;
      `;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (currentAbortController) currentAbortController.abort();
      overlay.remove();
    };

    btnGroup.append(playBtn, apiBtn, closeBtn);
    topBar.append(controls, btnGroup);

    const titleBar = document.createElement("div");
    titleBar.style.cssText = `
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #333;
      `;
    const titleText = document.createElement("div");
    titleText.style.cssText = "font-size:18px; font-weight:bold;";
    titleText.textContent = txt("c_preview");
    titleBar.appendChild(titleText);

    const pageControls = document.createElement("div");
    pageControls.style.cssText = "display:flex; gap:8px;";
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⬅";
    prevBtn.disabled = true;
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "➡";
    nextBtn.disabled = true;

    [prevBtn, nextBtn].forEach((b) => {
      b.style.cssText = `
              padding:2px 10px; border-radius:4px; border:none;
              cursor:pointer; background:#333; color:#fff;
          `;
    });
    pageControls.append(prevBtn, nextBtn);
    titleBar.appendChild(pageControls);

    const content = document.createElement("div");
    content.id = "c_content";
    content.style.cssText = "flex-grow:1; overflow-y:auto; min-height:200px;";

    box.append(topBar, titleBar, content);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    let allComments = [];
    let pageToken = "";
    let nextPageToken = "";
    let prevStack = [];

    const load = (pt = "") => {
      content.innerHTML =
        `<div style="text-align:center;color:#aaa;padding:20px;">${txt("c_loading")}</div>`;
      pageToken = pt;
      const order = document.getElementById("c_order").value;
      const max = document.getElementById("c_count").value;

      fetchComments(videoId, order, parseInt(max), pt, (data, error) => {
        content.innerHTML = "";
        if (error) {
          content.innerHTML = `<div style="color:#f66;">${error.message}</div>`;
          return;
        }
        if (!data.length) {
          content.innerHTML =
            `<div style="text-align:center;color:#aaa;">${txt("c_no_comments")}</div>`;
          return;
        }
        allComments = data;
        render(data);
        prevBtn.disabled = prevStack.length === 0;
        nextBtn.disabled = !nextPageToken;
        prevBtn.style.opacity = prevBtn.disabled ? 0.5 : 1;
        nextBtn.style.opacity = nextBtn.disabled ? 0.5 : 1;
      });
    };

    const render = (list) => {
      content.innerHTML = "";
      list.forEach((c) => {
        const div = document.createElement("div");
        div.style.cssText = "border-bottom:1px solid #333; padding:10px 0;";

        const authorDiv = document.createElement("div");
        authorDiv.style.cssText = "color:#aaa;font-size:12px;margin-bottom:4px;";
        authorDiv.textContent = c.author;

        const textDiv = document.createElement("div");
        textDiv.className = "c_text";
        textDiv.style.cssText = "line-height:1.4;white-space:pre-wrap;";
        textDiv.textContent = cleanHTML(c.text);

        const likeDiv = document.createElement("div");
        likeDiv.style.cssText = "color:#3ea6ff;font-size:12px;margin-top:4px;";
        likeDiv.textContent = `👍 ${c.likeCount}`;

        div.appendChild(authorDiv);
        div.appendChild(textDiv);
        div.appendChild(likeDiv);
        content.appendChild(div);
      });
      const lang = document.getElementById("c_lang").value;
      if (lang) translateAll(content, lang);
    };

    const fetchComments = (vid, order, target, pt, cb) => {
      let acc = [];
      let localPt = pt;
      const fetchPage = () => {
        const url = `${COMMENT_API}?part=snippet&videoId=${vid}&maxResults=${Math.min(target - acc.length, 100)}&order=${order}&key=${API_KEY}${localPt ? `&pageToken=${localPt}` : ""}`;
        GM_xmlhttpRequest({
          method: "GET",
          url,
          onload: (res) => {
            try {
              const json = JSON.parse(res.responseText);
              if (json.error) {
                cb([], { message: json.error?.message || txt("c_err_net") });
                return;
              }
              const items =
                json.items?.map((i) => {
                  const s = i.snippet.topLevelComment.snippet;
                  return {
                    text: s.textDisplay,
                    plain: s.textOriginal,
                    likeCount: s.likeCount,
                    author: s.authorDisplayName,
                  };
                }) || [];
              acc.push(...items);
              localPt = json.nextPageToken || "";
              nextPageToken = localPt;
              if (acc.length >= target || !localPt) {
                cb(acc.slice(0, target));
              } else {
                fetchPage();
              }
            } catch (e) {
              cb([], { message: txt("c_err_parse") });
            }
          },
          onerror: () => cb([], { message: txt("c_err_net") }),
        });
      };
      fetchPage();
    };

    document.getElementById("c_order").onchange = () => {
      prevStack = [];
      pageToken = "";
      nextPageToken = "";
      load();
    };

    document.getElementById("c_count").onchange = () => {
      prevStack = [];
      pageToken = "";
      nextPageToken = "";
      load();
    };

    document.getElementById("c_lang").onchange = () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
      const sel  = document.getElementById("c_lang");
      const lang = sel.value;
      if (lang) {
        bumpLangHit(lang);
        prependTopLangs(sel);
      }
      translateAll(content, lang);
    };

    document.getElementById("c_search").oninput = (e) => {
      const k = e.target.value.toLowerCase();
      render(
        allComments.filter(
          (c) =>
          c.text.toLowerCase().includes(k) ||
          c.plain?.toLowerCase().includes(k),
        ),
      );
    };

    prevBtn.onclick = () => {
      if (prevStack.length) {
        nextPageToken = pageToken;
        const p = prevStack.pop();
        load(p);
      }
    };

    nextBtn.onclick = () => {
      if (nextPageToken) {
        prevStack.push(pageToken);
        load(nextPageToken);
      }
    };

    load();
  }

  function cleanHTML(text) {
    try {
      const doc = new DOMParser().parseFromString(text, "text/html");
      return doc.body.textContent || "";
    } catch (_) {
      return text.replace(/<[^>]*>/g, "");
    }
  }

  function translateAll(container, lang) {
    container.querySelectorAll(".translated-text").forEach((el) => el.remove());

    if (!lang) {
      if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
      }
      return;
    }

    if (!LANG_LABEL_MAP[lang]) return;

    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const nodes = container.querySelectorAll(".c_text");
    if (nodes.length === 0) return;

    Promise.allSettled(Array.from(nodes).map(async (node) => {
      const text = node.textContent;
      if (!text.trim()) return;

      try {
        const res = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`,
          { signal },
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json || !Array.isArray(json[0])) {
          throw new Error("Invalid response");
        }

        const translated = json[0].map((x) => x[0]).join("");
        if (translated === text) return;

        if (signal.aborted) return;

        const translatedDiv = document.createElement("div");
        translatedDiv.textContent = translated;
        translatedDiv.style.cssText = `
                    background:black; color:yellow; padding:4px;
                    margin-top:2px; border-radius:4px;
                    user-select: text; cursor: text;
                `;
        translatedDiv.className = "translated-text";
        node.parentNode?.insertBefore(translatedDiv, node.nextSibling);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Translation error:", error);
      }
    })).catch(console.error);
  }

  function showApiKeyPrompt(vid) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
          position:fixed;top:0;left:0;width:100vw;height:100vh;
          background:rgba(0,0,0,0.9);z-index:2147483655;
          display:flex;justify-content:center;align-items:center;
      `;
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    const box = document.createElement("div");
    box.style.cssText = `
          width:400px;background:#222;color:white;padding:20px;
          border-radius:8px;text-align:center;
          box-shadow:0 0 20px rgba(0,0,0,0.5);
      `;
    box.onclick = (e) => e.stopPropagation();

    const _h3 = document.createElement("h3");
    _h3.style.marginTop = "0";
    _h3.textContent = txt("api_title");

    const _p = document.createElement("p");
    _p.style.cssText = "color:#aaa;font-size:14px;";
    _p.textContent = txt("api_desc");

    const _input = document.createElement("input");
    _input.type = "text";
    _input.id = "k_input";
    _input.placeholder = "API Key";
    _input.style.cssText = "width:90%;padding:8px;margin:10px 0;background:#111;border:1px solid #444;color:white;";

    const _btnRow = document.createElement("div");
    _btnRow.style.cssText = "display:flex;justify-content:center;gap:10px;";

    const _kSave = document.createElement("button");
    _kSave.id = "k_save";
    _kSave.textContent = txt("save");
    _kSave.style.cssText = "background:#3ea6ff;color:black;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;";

    const _kDel = document.createElement("button");
    _kDel.id = "k_del";
    _kDel.textContent = txt("api_del");
    _kDel.style.cssText = "background:#444;color:white;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;";

    _btnRow.appendChild(_kSave);
    _btnRow.appendChild(_kDel);

    const _linkRow = document.createElement("div");
    _linkRow.style.cssText = "margin-top:15px;font-size:12px;";
    const _link = document.createElement("a");
    _link.href = "https://console.cloud.google.com/apis/credentials";
    _link.target = "_blank";
    _link.style.color = "#0f9d58";
    _link.textContent = txt("api_apply");
    _linkRow.appendChild(_link);

    box.appendChild(_h3);
    box.appendChild(_p);
    box.appendChild(_input);
    box.appendChild(_btnRow);
    box.appendChild(_linkRow);

    box.querySelector("#k_input").value = API_KEY || "";
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector("#k_save").onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const k = box.querySelector("#k_input").value.trim();
      if (k) {
        API_KEY = k;
        GM_setValue("yt_comment_api_key", k);
        overlay.remove();
        if (vid) showComments(vid);
      }
    };

    box.querySelector("#k_del").onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      API_KEY = "";
      GM_setValue("yt_comment_api_key", "");
      overlay.remove();
      alert(txt("api_deleted_msg"));
    };
  }

  function initButtons() {
    const onSearch = window.location.pathname === "/results";
    const targets =
      "ytd-thumbnail, ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer";

    document.querySelectorAll(targets).forEach((el) => {
      const anchor = el.querySelector('a[href*="/watch"], a[href*="/shorts/"]');
      if (!anchor) return;

      if (!onSearch) {
        const container = el.querySelector("ytd-thumbnail") || el;
        if (container.offsetWidth > 0) addButtons(container, anchor);
        return;
      }

      const card = el.closest("ytd-video-renderer");
      if (!card) return;

      const container = card.querySelector("ytd-thumbnail") || card;
      if (container.offsetWidth > 0) addButtons(container, anchor);

      if (card.dataset.sfxReady) return;
      card.dataset.sfxReady = "1";

      const thumb = card.querySelector("ytd-thumbnail") || card;

      card.addEventListener("mouseenter", () => _sfxShow(thumb, anchor));
      card.addEventListener("mouseleave", (e) => {
        if (e.relatedTarget === _sfPlay || e.relatedTarget === _sfComment) return;
        _sfxHide();
      });
    });
  }

  function addResourceHints() {
    const domains = [
      "https://www.youtube.com",
      "https://i.ytimg.com",
      "https://googlevideo.com",
    ];
    const head = document.head || document.documentElement;

    domains.forEach((d) => {
      if (!head.querySelector(`link[rel="preconnect"][href="${d}"]`)) {
        const l = document.createElement("link");
        l.rel = "preconnect";
        l.href = d;
        l.crossOrigin = "anonymous";
        head.appendChild(l);
      }
    });

    domains.forEach((d) => {
      if (!head.querySelector(`link[rel="dns-prefetch"][href="${d}"]`)) {
        const l = document.createElement("link");
        l.rel = "dns-prefetch";
        l.href = d;
        head.appendChild(l);
      }
    });
  }

  addResourceHints();

  let _initDebounce = null;
  const _debouncedInitButtons = () => {
    clearTimeout(_initDebounce);
    _initDebounce = setTimeout(initButtons, 250);
  };

  const observer = new MutationObserver(_debouncedInitButtons);
  CleanupManager.addObserver(observer);
  observer.observe(document.body, { childList: true, subtree: true });

  const _pauseObserver  = () => observer.disconnect();
  const _resumeObserver = () => observer.observe(document.body, { childList: true, subtree: true });

  CleanupManager.addListener(window, "yt-navigate-finish", initButtons);
  setTimeout(initButtons, 1000);
})();