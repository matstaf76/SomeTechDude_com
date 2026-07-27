/* SomeTechDude.com — shared behaviour. No frameworks, no build step. */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Current-year stamp ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Hacker News feed ----------
     Pulls the current top stories. If anything at all goes wrong — offline,
     rate limit, API change — the whole section removes itself rather than
     sitting there saying "Loading..." forever, which is what the old one did.
  */
  var feed = document.getElementById("news-feed");

  if (feed) {
    var section = document.getElementById("signal");

    var giveUp = function () {
      if (section && section.parentNode) section.parentNode.removeChild(section);
    };

    var withTimeout = function (url, ms) {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timer = setTimeout(function () {
          if (!done) { done = true; reject(new Error("timeout")); }
        }, ms);
        fetch(url)
          .then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            return r.json();
          })
          .then(function (data) {
            if (!done) { done = true; clearTimeout(timer); resolve(data); }
          })
          .catch(function (err) {
            if (!done) { done = true; clearTimeout(timer); reject(err); }
          });
      });
    };

    var escapeHtml = function (s) {
      return String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    };

    var safeUrl = function (u) {
      return /^https?:\/\//i.test(u || "") ? u : null;
    };

    var API = "https://hacker-news.firebaseio.com/v0";

    withTimeout(API + "/topstories.json", 6000)
      .then(function (ids) {
        if (!Array.isArray(ids) || !ids.length) throw new Error("no ids");
        // Fetch in parallel, not one-at-a-time like the old version.
        return Promise.all(ids.slice(0, 5).map(function (id) {
          return withTimeout(API + "/item/" + id + ".json", 6000).catch(function () { return null; });
        }));
      })
      .then(function (stories) {
        var live = stories.filter(function (s) { return s && s.title; });
        if (!live.length) return giveUp();

        feed.innerHTML = "";
        live.forEach(function (story) {
          var row = document.createElement("div");
          row.className = "terminal-row";

          var url = safeUrl(story.url) ||
                    ("https://news.ycombinator.com/item?id=" + encodeURIComponent(story.id));

          row.innerHTML =
            '<span class="prompt" aria-hidden="true">&gt;</span>' +
            '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(story.title) + "</a>";

          feed.appendChild(row);
        });
      })
      .catch(giveUp);
  }

  /* ---------- Contact form ----------
     Posts as form-encoded data so the browser treats it as a "simple request"
     and skips the CORS preflight that Apps Script cannot answer.
  */
  var form = document.getElementById("contact-form");

  if (form) {
    var status = document.getElementById("form-status");
    var submit = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute("data-endpoint");

    var say = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status show " + kind;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.reportValidity()) return;

      var original = submit ? submit.textContent : "";
      if (submit) { submit.disabled = true; submit.textContent = "Sending..."; }
      if (status) status.className = "form-status";

      fetch(endpoint, {
        method: "POST",
        body: new URLSearchParams(new FormData(form))
      })
        .then(function (r) { return r.json().catch(function () { return { result: "ok" }; }); })
        .then(function (data) {
          if (data && data.result === "error") {
            say(data.message || "Something went sideways. Try the email link below.", "err");
          } else {
            form.reset();
            say("Got it. Your message landed — expect a reply within one business day.", "ok");
          }
        })
        .catch(function () {
          say(
            "Could not reach the server. Email sometechdude76@gmail.com directly and it will get there.",
            "err"
          );
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = original; }
        });
    });
  }
})();
