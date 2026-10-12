// Copy of the shared feedback widget 1.0.0 (feedback-platform commit 4e2cb46), used as a stale cached widget in tests.
/**
 * Embeddable feedback widget — vanilla JS, zero dependencies, Shadow DOM.
 *
 * One-line embed:
 *   <script src="https://feedback.andreizimin.com/widget.js"
 *           data-project="weekendradar" defer></script>
 *
 * Configured via the <script> tag's data-* attributes:
 *   data-project   (required) app slug — used for tracing + Linear label
 *   data-endpoint  (optional) submit URL; defaults to "/submit" on this script's own origin
 *   data-accent    (optional) hex accent colour (default forest green #226B4E)
 *   data-label     (optional) button text (default "Feedback")
 *   data-position  (optional) bottom-right | bottom-left (default bottom-right)
 *
 * Renders entirely inside a Shadow DOM so the host page's CSS can never clash.
 */
(function () {
  "use strict";

  var WIDGET_VERSION = "1.0.0";

  // --- Resolve our own <script> tag and config -----------------------------
  var self =
    document.currentScript ||
    (function () {
      var s = document.querySelectorAll("script[src]");
      for (var i = s.length - 1; i >= 0; i--) {
        if (/widget\.js(\?|$)/.test(s[i].src)) return s[i];
      }
      return null;
    })();

  var cfg = self ? self.dataset : {};
  var project = (cfg.project || "").trim();
  if (!project) {
    console.warn("[feedback-widget] missing data-project — widget not loaded");
    return;
  }

  // Default endpoint = "/submit" on the origin this script was served from, so
  // it works on any host page without hardcoding an ugly URL.
  var scriptOrigin = self ? new URL(self.src, location.href).origin : location.origin;
  var endpoint = (cfg.endpoint || "").trim() || scriptOrigin + "/submit";

  var accent = (cfg.accent || "#226B4E").trim();
  var label = (cfg.label || "Feedback").trim();
  var position = (cfg.position || "bottom-right").trim();

  // Guard against double-injection.
  if (document.getElementById("feedback-widget-host")) return;

  // --- Fonts (match the portfolio look; degrade gracefully) ----------------
  if (!document.getElementById("feedback-widget-fonts")) {
    var link = document.createElement("link");
    link.id = "feedback-widget-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400&display=swap";
    document.head.appendChild(link);
  }

  // --- Host + Shadow root ---------------------------------------------------
  var host = document.createElement("div");
  host.id = "feedback-widget-host";
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  var side = position === "bottom-left" ? "left: 1.25rem;" : "right: 1.25rem;";

  var style = document.createElement("style");
  style.textContent = [
    ":host{all:initial;}",
    "*{box-sizing:border-box;}",
    // Honour the [hidden] attribute even on elements with an explicit display
    // (e.g. .overlay{display:flex}), so the modal stays closed until opened.
    "[hidden]{display:none !important;}",
    ":host{",
    "  --paper:#fbfaf6; --paper-2:#f1f0ea; --ink:#1a1a1d; --ink-soft:#54555b;",
    "  --line:#e4e3db; --accent:" + accent + "; --accent-hover:#2e8a65;",
    "  --sans:'Space Grotesk',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace;",
    "}",
    ".fab{position:fixed;bottom:1.25rem;" +
      side +
      "z-index:2147483646;display:inline-flex;align-items:center;gap:.45rem;padding:.6rem 1rem;border:none;border-radius:999px;background:var(--accent);color:#fff;font-family:var(--sans);font-size:.85rem;font-weight:600;cursor:pointer;box-shadow:0 8px 22px -8px rgba(34,107,78,.6);transition:transform .18s ease,background .18s ease;}",
    ".fab:hover{background:var(--accent-hover);transform:translateY(-2px);}",
    ".fab:focus-visible{outline:2px solid var(--ink);outline-offset:2px;}",
    ".overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:flex-end;justify-content:center;padding:1rem;background:rgba(26,26,29,.45);backdrop-filter:blur(2px);animation:fade .18s ease both;}",
    "@media(min-width:560px){.overlay{align-items:center;}}",
    "@keyframes fade{from{opacity:0;}}",
    ".overlay.closing{animation:fadeout .45s ease both;}",
    "@keyframes fadeout{to{opacity:0;}}",
    ".modal{position:relative;width:100%;max-width:30rem;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:1.6rem 1.5rem 1.5rem;box-shadow:0 24px 60px -18px rgba(26,26,29,.45);animation:rise .22s cubic-bezier(.22,1,.36,1) both;color:var(--ink);}",
    "@keyframes rise{from{opacity:0;transform:translateY(14px);}}",
    ".close{position:absolute;top:.6rem;right:.8rem;border:none;background:none;font-size:1.5rem;line-height:1;color:var(--ink-soft);cursor:pointer;}",
    ".close:hover{color:var(--ink);}",
    ".mono{font-family:var(--mono);font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft);}",
    ".title{font-family:var(--sans);font-weight:700;font-size:1.45rem;letter-spacing:-.01em;margin:.4rem 0 1.1rem;}",
    ".seg{display:flex;gap:.5rem;margin-bottom:.9rem;}",
    ".seg button{flex:1;padding:.5rem;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);font-family:var(--sans);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s ease;}",
    ".seg button.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--paper));color:var(--accent);}",
    ".input{width:100%;padding:.6rem .7rem;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-family:var(--sans);font-size:.95rem;margin-bottom:.6rem;resize:vertical;}",
    ".input:focus-visible{outline:none;border-color:var(--accent);}",
    ".row{display:flex;gap:.6rem;}",
    ".row .input{flex:1;min-width:0;}",
    ".hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}",
    ".error{color:#b4231f;font-size:.85rem;margin:.2rem 0 .6rem;}",
    ".submit{width:100%;margin-top:.5rem;padding:.7rem;border:none;border-radius:999px;background:var(--ink);color:#fff;font-family:var(--sans);font-size:.9rem;font-weight:600;cursor:pointer;transition:background .15s ease;}",
    ".submit:hover{background:var(--accent);}",
    ".submit:disabled{opacity:.5;cursor:not-allowed;}",
    ".done{text-align:center;padding:1rem 0 .4rem;}",
    ".done h3{font-family:var(--sans);font-size:1.4rem;margin:0 0 .5rem;}",
    ".done p{color:var(--ink-soft);margin:0 0 1.2rem;}",
    "@media(prefers-reduced-motion:reduce){.overlay,.overlay.closing,.modal,.fab{animation:none;transition:none;}}",
  ].join("\n");
  root.appendChild(style);

  // --- Markup ---------------------------------------------------------------
  var wrap = document.createElement("div");
  wrap.innerHTML =
    '<button class="fab" type="button" aria-label="Suggest a feature or report a bug"><span aria-hidden="true">💬</span> ' +
    escapeHtml(label) +
    "</button>" +
    '<div class="overlay" hidden>' +
    '  <div class="modal" role="dialog" aria-modal="true" aria-label="Send feedback">' +
    '    <button class="close" type="button" aria-label="Close">×</button>' +
    '    <div class="view-form">' +
    '      <span class="mono">Suggest a feature · report a bug</span>' +
    '      <h3 class="title">What\'s on your mind?</h3>' +
    '      <form>' +
    '        <div class="seg" role="tablist">' +
    '          <button type="button" class="seg-feature active">💡 Feature</button>' +
    '          <button type="button" class="seg-bug">🐞 Bug</button>' +
    "        </div>" +
    '        <textarea class="input fb-message" rows="4" maxlength="4000" required placeholder="What would make this better?"></textarea>' +
    '        <div class="row">' +
    '          <input class="input fb-name" maxlength="120" placeholder="Name (optional)">' +
    '          <input class="input fb-contact" maxlength="200" placeholder="Email/LinkedIn (optional)">' +
    "        </div>" +
    '        <input class="hp fb-company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '        <p class="error" hidden>Something went wrong — please try again.</p>' +
    '        <button class="submit" type="submit">Send</button>' +
    "      </form>" +
    "    </div>" +
    '    <div class="view-done done" hidden>' +
    "      <h3>Thank you! 🙌</h3>" +
    '      <p class="done-msg">Got it — your feedback is on its way.</p>' +
    '      <button class="submit again" type="button">Send another</button>' +
    "    </div>" +
    "  </div>" +
    "</div>";
  root.appendChild(wrap);

  // --- Element refs ----------------------------------------------------------
  var $ = function (sel) {
    return root.querySelector(sel);
  };
  var fab = $(".fab");
  var overlay = $(".overlay");
  var modal = $(".modal");
  var form = $("form");
  var segFeature = $(".seg-feature");
  var segBug = $(".seg-bug");
  var msgEl = $(".fb-message");
  var nameEl = $(".fb-name");
  var contactEl = $(".fb-contact");
  var companyEl = $(".fb-company");
  var errEl = $(".error");
  var submitBtn = $(".submit[type=submit]");
  var viewForm = $(".view-form");
  var viewDone = $(".view-done");
  var doneMsg = $(".done-msg");

  var type = "feature";
  var sending = false;
  var doneTimer = null;

  // --- Behaviour -------------------------------------------------------------
  function open() {
    clearAutoClose();
    overlay.hidden = false;
    setTimeout(function () {
      msgEl.focus();
    }, 0);
  }
  function close() {
    clearAutoClose();
    overlay.hidden = true;
    showForm();
  }
  // Cancel any pending auto-dismiss and drop the fade-out class. Dropping the
  // "closing" class also neutralises any in-flight finish() (it bails unless
  // the class is still present), so interrupting the fade can't snap us shut.
  function clearAutoClose() {
    if (doneTimer) {
      clearTimeout(doneTimer);
      doneTimer = null;
    }
    overlay.classList.remove("closing");
  }
  // After a successful submit, hold the thank-you for 3s, then fade the
  // whole modal away instead of leaving the user parked on "Send another".
  function scheduleAutoClose() {
    doneTimer = setTimeout(function () {
      doneTimer = null;
      overlay.classList.add("closing");
      var finish = function () {
        // Bail if the auto-close was cancelled while the fade was running.
        if (!overlay.classList.contains("closing")) return;
        overlay.removeEventListener("animationend", finish);
        close();
      };
      overlay.addEventListener("animationend", finish);
      // Fallback in case the animation is suppressed (reduced motion, etc.).
      setTimeout(finish, 600);
    }, 3000);
  }
  function showForm() {
    viewForm.hidden = false;
    viewDone.hidden = true;
    errEl.hidden = true;
  }
  // Wipe the user's entries so a reopened widget never shows stale text.
  function resetFields() {
    msgEl.value = "";
    nameEl.value = "";
    contactEl.value = "";
  }
  function setType(t) {
    type = t;
    segFeature.classList.toggle("active", t === "feature");
    segBug.classList.toggle("active", t === "bug");
    msgEl.placeholder =
      t === "bug"
        ? "What went wrong? Where did you see it?"
        : "What would make this better?";
  }

  fab.addEventListener("click", open);
  $(".close").addEventListener("click", close);
  $(".again").addEventListener("click", function () {
    clearAutoClose();
    resetFields();
    showForm();
    msgEl.focus();
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  modal.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
  segFeature.addEventListener("click", function () {
    setType("feature");
  });
  segBug.addEventListener("click", function () {
    setType("bug");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    var message = msgEl.value.trim();
    if (!message) return;
    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    errEl.hidden = true;

    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload(message)),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        viewForm.hidden = true;
        viewDone.hidden = false;
        doneMsg.textContent =
          "Got it — your " +
          (type === "bug" ? "bug report" : "suggestion") +
          " is on its way.";
        // Flush the entries now so any dismissal (auto-fade, close, Esc)
        // leaves a clean form the next time the widget is opened.
        resetFields();
        scheduleAutoClose();
      })
      .catch(function () {
        errEl.hidden = false;
      })
      .then(function () {
        sending = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Send";
      });
  });

  // --- Tracing payload -------------------------------------------------------
  function deriveEnv() {
    var h = location.hostname;
    if (!h || h === "localhost" || h === "127.0.0.1" || h.endsWith(".local"))
      return "localhost";
    if (/(^|\.)(dev|staging|stage|preview)\./.test(h) || /\.cloudfront\.net$/.test(h))
      return "dev";
    return "prod";
  }
  function shortId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    ).toLowerCase();
  }
  function payload(message) {
    return {
      project: project,
      type: type,
      message: message,
      name: nameEl.value,
      contact: contactEl.value,
      company: companyEl.value, // honeypot
      page: location.pathname,
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: window.innerWidth + "x" + window.innerHeight,
      env: deriveEnv(),
      widgetVersion: WIDGET_VERSION,
      traceId: shortId(),
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
})();
