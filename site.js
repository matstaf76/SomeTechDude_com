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
