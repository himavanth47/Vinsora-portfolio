/* VINSORA – site scripts (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "917339663729"; // country code + number, no "+" or spaces

  // ---------- WhatsApp links ----------
  // wa.me short links often hang on a loading screen, so we link directly:
  // phones/tablets -> WhatsApp app, computers -> WhatsApp Web.
  var isMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent) ||
                 (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS
  function whatsappUrl(text) {
    var base = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
    return base + "?phone=" + WHATSAPP_NUMBER + (text ? "&text=" + encodeURIComponent(text) : "");
  }
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    var text = "";
    try { text = new URL(a.href).searchParams.get("text") || ""; } catch (e) {}
    a.href = whatsappUrl(text);
  });

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Header shadow on scroll ----------
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  var toggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("open"));
  });
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // ---------- Highlight current section in nav ----------
  var navAnchors = navLinks.querySelectorAll('a[href^="#"]:not(.btn)');
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navAnchors.forEach(function (a) {
      var section = document.querySelector(a.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  // ---------- Project filters ----------
  var filters = document.querySelectorAll(".filter");
  var projects = document.querySelectorAll(".project-card");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.dataset.filter;
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      projects.forEach(function (card) {
        card.hidden = !(value === "all" || card.dataset.category === value);
      });
    });
  });

  // ---------- Scroll reveal: gentle slide-in, replays scrolling up or down ----------
  (function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var groups = [
      [".hero-text", "from-left"], [".hero-visual", "from-right"],
      [".section-head", ""], [".trust-grid > div", ""],
      [".service-card", ""], [".industry-card", ""], [".project-card", ""],
      [".testimonial", ""], [".process-step", ""],
      [".about-text", "from-left"], [".values", "from-right"],
      [".faq-list details", ""], [".cta-inner", ""],
      [".contact-info", "from-left"], [".contact-form", "from-right"], [".visit-card", ""]
    ];
    var items = [];
    groups.forEach(function (g) {
      var els = document.querySelectorAll(g[0]);
      els.forEach(function (el, i) {
        el.classList.add("reveal");
        if (g[1]) el.classList.add(g[1]);
        // stagger siblings in a row (max 0.3s)
        el.style.setProperty("--d", Math.min((i % 4) * 0.08, 0.3) + "s");
        items.push(el);
      });
    });
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    // Show when 12% visible; reset once fully off-screen, so it replays
    // in either scroll direction. "above" = left the screen through the top.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.intersectionRatio >= 0.12) {
          el.classList.add("in");
        } else if (!e.isIntersecting) {
          el.classList.remove("in");
          el.classList.toggle("above", e.boundingClientRect.top < 0);
        }
      });
    }, { threshold: [0, 0.12] });
    items.forEach(function (el) { io.observe(el); });
  })();

  // ---------- Testimonial typing effect (runs once, when scrolled into view) ----------
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".typewriter").forEach(function (el) {
    var live = el.querySelector(".type-live");
    var text = el.dataset.text;
    if (reduceMotion || !("IntersectionObserver" in window)) return; // full text already shown

    live.textContent = "";
    var started = false;
    var obs = new IntersectionObserver(function (entries) {
      if (started || !entries[0].isIntersecting) return;
      started = true;
      obs.disconnect();
      el.classList.add("typing");
      // Split into whole letters (graphemes) so Tamil vowel signs never show half-typed
      var chars = (window.Intl && Intl.Segmenter)
        ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), function (s) { return s.segment; })
        : Array.from(text);
      var i = 0;
      (function type() {
        i++;
        live.textContent = chars.slice(0, i).join("");
        if (i < chars.length) {
          var ch = chars[i - 1];
          setTimeout(type, /[.,:!?]/.test(ch) ? 260 : 28);
        } else {
          setTimeout(function () { el.classList.remove("typing"); }, 1500);
        }
      })();
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ---------- Contact form → email (via FormSubmit.co, no backend needed) ----------
  // Enquiries are delivered to this inbox. The very first submission sends an
  // activation email to it: open that email and click "Activate Form" once.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/starlinegk@gmail.com";

  var form = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");
  var fail = document.getElementById("formFail");
  var submitBtn = document.getElementById("formSubmit");
  var f = form.elements;

  function setError(field, message) {
    var wrap = field.closest(".field");
    wrap.classList.toggle("invalid", !!message);
    wrap.querySelector(".error").textContent = message || "";
  }

  function validate() {
    var ok = true;
    var name = f.name.value.trim();
    var phone = f.phone.value.replace(/[\s\-()]/g, "");
    var email = f.email.value.trim();

    if (name.length < 2) { setError(f.name, "Please enter your name."); ok = false; } else setError(f.name);
    if (!/^\+?\d{10,13}$/.test(phone)) { setError(f.phone, "Please enter a valid phone number."); ok = false; } else setError(f.phone);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(f.email, "Please check your email address."); ok = false; } else setError(f.email);
    if (!f.service.value) { setError(f.service, "Please choose a service."); ok = false; } else setError(f.service);
    return ok;
  }

  function setSending(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : "Send Enquiry";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.hidden = true;
    fail.hidden = true;
    if (!validate()) {
      var firstInvalid = form.querySelector(".invalid input, .invalid select, .invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (f._honey.value) { success.hidden = false; form.reset(); return; } // bot: pretend success

    var data = {
      "Name": f.name.value.trim(),
      "Phone": f.phone.value.trim(),
      "Email": f.email.value.trim() || "Not provided",
      "Business": f.business.value.trim() || "Not provided",
      "Service": f.service.value,
      "Message": f.message.value.trim() || "No message",
      "_subject": "New website enquiry: " + f.service.value + " (" + f.name.value.trim() + ")",
      "_template": "table",
      "_captcha": "false"
    };
    if (f.email.value.trim()) data["_replyto"] = f.email.value.trim(); // lets you hit Reply

    setSending(true);
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok || String(body.success) === "false") throw new Error(body.message || "Send failed");
      }); })
      .then(function () { success.hidden = false; form.reset(); })
      .catch(function () { fail.hidden = false; })
      .then(function () { setSending(false); });
  });

  // Clear an error as soon as the user fixes the field
  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      if (el.closest(".field").classList.contains("invalid")) setError(el);
    });
  });
})();
