/* ============================================================
   Webbtjänst — main.js
   Delas av alla sidor. Länkas med <script defer>.
   ============================================================ */

/* Permanent Convex-endpoint för vanliga kontaktformulär. Checkout-formuläret
   använder sin separat deklarerade endpoint på starta-projekt.html. */
const FORM_ENDPOINT = "https://neat-gnu-616.convex.site/api/lead";

/* Stabil site key så backend kan isolera Webbtjänsts leads och retention. */
const LEAD_SITE_KEY = "webbtjanst";

(function () {
  "use strict";

  /* ---------- Mobilmeny ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  const closeBtn = drawer ? drawer.querySelector(".nav-drawer__close") : null;

  function openMenu() {
    if (!drawer) return;
    document.body.classList.add("nav-open");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!drawer) return;
    document.body.classList.remove("nav-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    // Stäng när en drawer-länk klickas
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Boka möte i alla navigeringar ---------- */
  document.querySelectorAll(".site-nav").forEach(function (nav) {
    if (nav.querySelector('a[href$="boka-mote"]')) return;
    var link = document.createElement("a");
    link.href = "/boka-mote";
    link.textContent = "Boka möte";
    var cta = nav.querySelector(".nav-cta");
    nav.insertBefore(link, cta || null);
  });
  document.querySelectorAll(".nav-drawer nav").forEach(function (nav) {
    if (nav.querySelector('a[href$="boka-mote"]')) return;
    var link = document.createElement("a");
    link.href = "/boka-mote";
    link.textContent = "Boka möte";
    var cta = nav.querySelector(".btn");
    nav.insertBefore(link, cta || null);
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Bokningssida: välj mötesperson ---------- */
  var bookingPeople = document.querySelectorAll("[data-booking-person]");
  var bookingPanels = document.querySelectorAll("[data-booking-panel]");
  var activeBookingWrap = null;
  var openingBookingWrap = null;
  var openingBookingTimer = null;

  function queueBookingOverlay(wrap) {
    if (activeBookingWrap === wrap || openingBookingWrap === wrap) return;
    if (openingBookingTimer) window.clearTimeout(openingBookingTimer);
    if (openingBookingWrap) openingBookingWrap.classList.remove("is-opening");
    openingBookingWrap = wrap;
    wrap.classList.add("is-opening");
    openingBookingTimer = window.setTimeout(function () {
      wrap.classList.remove("is-opening");
      openingBookingWrap = null;
      openingBookingTimer = null;
      openBookingOverlay(wrap);
    }, 550);
  }

  function openBookingOverlay(wrap) {
    if (activeBookingWrap === wrap) return;
    closeBookingOverlay();
    activeBookingWrap = wrap;
    wrap.classList.add("is-booking-active");
    document.body.classList.add("booking-form-open");
  }

  function closeBookingOverlay() {
    if (openingBookingTimer) window.clearTimeout(openingBookingTimer);
    if (openingBookingWrap) openingBookingWrap.classList.remove("is-opening");
    openingBookingTimer = null;
    openingBookingWrap = null;
    if (!activeBookingWrap) return;
    var activeFrame = activeBookingWrap.querySelector(".booking-frame");
    activeBookingWrap.classList.remove("is-booking-active");
    document.body.classList.remove("booking-form-open");
    // Google keeps its internal form open after the parent layer closes.
    // Reload only that iframe so the inline view returns to date and time selection.
    if (activeFrame) {
      var resetWrap = activeBookingWrap;
      resetWrap.classList.add("is-resetting");
      activeFrame.addEventListener("load", function () {
        resetWrap.classList.remove("is-resetting");
      }, { once: true });
      activeFrame.src = activeFrame.src;
    }
    activeBookingWrap = null;
  }

  document.querySelectorAll(".booking-frame-wrap").forEach(function (wrap) {
    var frame = wrap.querySelector(".booking-frame");
    var close = wrap.querySelector(".booking-overlay-close");
    if (!frame || !close) return;

    frame.addEventListener("focus", function () {
      queueBookingOverlay(wrap);
    });
    close.addEventListener("click", closeBookingOverlay);
  });

  // Clicking inside a cross-origin iframe moves focus away from the parent window.
  // This fallback covers browsers that do not dispatch focus directly on the iframe.
  window.addEventListener("blur", function () {
    window.setTimeout(function () {
      var frame = document.activeElement;
      if (frame && frame.classList && frame.classList.contains("booking-frame")) {
        queueBookingOverlay(frame.closest(".booking-frame-wrap"));
      }
    }, 0);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeBookingOverlay();
  });
  bookingPeople.forEach(function (button) {
    button.addEventListener("click", function () {
      var selected = button.getAttribute("data-booking-person");
      closeBookingOverlay();
      bookingPeople.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-selected", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      bookingPanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-booking-panel") !== selected;
      });
    });
  });

  /* ---------- Aktuellt år i footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Referensdemos: bevara utgångspunkten ----------
     Varje kort är en riktig länk. Vid ett vanligt klick lägger vi till den
     aktuella scrollpositionen, så Tillbaka/X från demon återvänder till samma
     kort i stället för högst upp på startsidan eller referenssidan. */
  document.querySelectorAll("a.ref-card--link[href]").forEach(function (card) {
    card.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof event.button === "number" && event.button !== 0) return;
      var destination = new URL(card.href, window.location.href);
      destination.searchParams.set("returnY", String(Math.max(0, Math.round(window.scrollY))));
      card.href = destination.toString();
    });
  });

  (function restoreDemoScrollPosition() {
    var current = new URL(window.location.href);
    var rawReturnY = current.searchParams.get("returnY");
    if (rawReturnY === null) return;
    var returnY = Number(rawReturnY);
    current.searchParams.delete("returnY");
    window.history.replaceState({}, "", current.pathname + (current.search || "") + current.hash);
    if (!Number.isFinite(returnY) || returnY < 0) return;
    // Two frames lets images and the document height settle before restoration.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.scrollTo({ top: returnY, left: 0, behavior: "auto" });
      });
    });
  })();

  /* ---------- Nyhetsbrev (lokal demo — ingen POST) ---------- */
  document.querySelectorAll("form.newsletter-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".newsletter-msg");
      if (msg) {
        msg.textContent = "Tack! Vi hör av oss när vi lanserar nyhetsbrevet.";
        msg.hidden = false;
      }
      form.reset();
    });
  });

  /* ---------- Villkorade fält (data-show på radiogrupp) ----------
     Exempel:
       <fieldset class="form-field" data-show="#ai-plan-wrap">
         <input type="radio" name="ai" value="ja">
         <input type="radio" name="ai" value="nej">
       </fieldset>
       <div id="ai-plan-wrap" hidden> ... </div>
     Visa målelementet när "ja" är valt. */
  document.querySelectorAll("[data-show]").forEach(function (group) {
    var target = document.querySelector(group.getAttribute("data-show"));
    if (!target) return;
    var radios = group.querySelectorAll('input[type="radio"]');

    function sync() {
      var checked = group.querySelector('input[type="radio"]:checked');
      var visible = !!(checked && checked.value === "ja");
      target.hidden = !visible;
      // Rensa val i dolda selects
      if (!visible) {
        target.querySelectorAll("select").forEach(function (s) {
          s.selectedIndex = 0;
        });
      }
    }

    radios.forEach(function (r) {
      r.addEventListener("change", sync);
    });
    sync();
  });

  /* ---------- Starta projekt: stegvis paketbyggare (lokal preview) ---------- */
  document.querySelectorAll("form[data-project-builder]").forEach(function (builder) {
    var oneTimePrices = {
      start: 15000,
      tillvaxt: 30000,
      premium: 60000
    };
    var oneTimeLabels = {
      start: "Start",
      tillvaxt: "Tillväxt",
      premium: "Premium"
    };
    var aiRegularPrices = {
      nej: 0,
      start: 3500,
      tillvaxt: 8500,
      premium: 24800
    };
    var aiBetaPrices = {
      nej: 0,
      start: 1750,
      tillvaxt: 4250,
      premium: 12400
    };
    var aiBetaEnd = new Date(builder.getAttribute("data-ai-beta-end") || "");
    var aiBetaIsActive = !Number.isNaN(aiBetaEnd.getTime()) && new Date() <= aiBetaEnd;
    var aiPrices = aiBetaIsActive ? aiBetaPrices : aiRegularPrices;
    var aiLabels = {
      nej: "Ingen AI-receptionist",
      start: "AI Start",
      tillvaxt: "AI Tillväxt",
      premium: "AI Premium"
    };
    var maintenancePrices = {
      nej: 0,
      online: 500,
      trygg: 1200,
      aktiv: 3200,
      partner: 6900
    };
    var maintenanceLabels = {
      nej: "Utan underhåll",
      online: "Online",
      trygg: "Trygg",
      aktiv: "Aktiv",
      partner: "Partner"
    };

    function valueFor(name) {
      var selected = builder.querySelector('input[name="' + name + '"]:checked');
      return selected ? selected.value : "";
    }

    function formatSek(value) {
      return new Intl.NumberFormat("sv-SE").format(value) + " kr";
    }

    function syncAiBetaPresentation() {
      builder.querySelectorAll("[data-ai-beta-notice]").forEach(function (notice) {
        notice.hidden = !aiBetaIsActive;
      });
      builder.querySelectorAll("[data-ai-beta-price]").forEach(function (price) {
        var regular = Number(price.getAttribute("data-regular-price"));
        var beta = Number(price.getAttribute("data-beta-price"));
        var regularOutput = price.querySelector("[data-ai-beta-regular]");
        var currentOutput = price.querySelector("[data-ai-beta-current]");
        var label = price.closest(".project-choice-card").querySelector("[data-ai-beta-label]");
        if (regularOutput) regularOutput.hidden = !aiBetaIsActive;
        if (label) label.hidden = !aiBetaIsActive;
        if (currentOutput) {
          currentOutput.innerHTML = new Intl.NumberFormat("sv-SE").format(aiBetaIsActive ? beta : regular) + " <small>kr/mån</small>";
        }
      });
    }

    var stages = ["package", "ai", "maintenance", "contact"];
    var stageLabels = {
      package: "Välj hemsidepaket",
      ai: "Välj AI-receptionist",
      maintenance: "Välj underhåll",
      contact: "Kontaktuppgifter"
    };
    var currentStage = "package";

    function setStep(stepName, visible) {
      var step = builder.querySelector('[data-builder-step="' + stepName + '"]');
      if (!step) return;
      step.hidden = !visible;
      step.classList.toggle("is-active", visible);
    }

    function updateProgress() {
      var progress = builder.querySelector("[data-builder-progress]");
      if (!progress) return;
      progress.textContent = "Steg " + (stages.indexOf(currentStage) + 1) + " av " + stages.length + " · " + stageLabels[currentStage];
    }

    function goToStage(stageName, shouldScroll) {
      if (stages.indexOf(stageName) === -1) return;
      currentStage = stageName;
      stages.forEach(function (stage) {
        setStep(stage, stage === currentStage);
      });
      updateProgress();
      syncBuilder();

      if (shouldScroll) {
        window.requestAnimationFrame(function () {
          var target = builder.querySelector('[data-builder-step="' + currentStage + '"]');
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    function syncBuilder() {
      var packageValue = valueFor("paket");
      var aiValue = valueFor("ai");
      var maintenanceValue = valueFor("underhall");
      var packageChosen = Boolean(packageValue);
      var aiChosen = Boolean(aiValue);
      var maintenanceChosen = Boolean(maintenanceValue);
      var oneTime = oneTimePrices[packageValue] || 0;
      var monthly = (aiPrices[aiValue] || 0) + (maintenancePrices[maintenanceValue] || 0);
      var summary = builder.querySelector("[data-builder-summary]");
      var summaryChoice = builder.querySelector("[data-builder-choice]");
      var oneTimeOutput = builder.querySelector("[data-builder-one-time]");
      var monthlyLabel = builder.querySelector("[data-builder-monthly-label]");
      var monthlyOutput = builder.querySelector("[data-builder-monthly]");
      var monthlyNote = builder.querySelector("[data-builder-monthly-note]");
      var submit = builder.querySelector(".project-builder__submit");

      if (summary) summary.hidden = currentStage !== "contact" || !(packageChosen && aiChosen && maintenanceChosen);
      if (submit) submit.hidden = currentStage !== "contact" || !(packageChosen && aiChosen && maintenanceChosen);

      if (summaryChoice) {
        var labels = [];
        if (packageValue) labels.push(oneTimeLabels[packageValue]);
        if (aiValue && aiValue !== "nej") labels.push(aiLabels[aiValue]);
        if (maintenanceValue && maintenanceValue !== "nej") labels.push(maintenanceLabels[maintenanceValue]);
        summaryChoice.textContent = labels.length ? labels.join(" + ") : "Välj tillvalen i nästa steg";
      }
      if (oneTimeOutput) oneTimeOutput.textContent = packageChosen ? formatSek(oneTime) : "—";
      if (monthlyLabel) monthlyLabel.hidden = !(aiValue && maintenanceValue && monthly > 0);
      if (monthlyOutput) monthlyOutput.textContent = formatSek(monthly);
      if (monthlyNote) {
        var regularMonthly = (aiRegularPrices[aiValue] || 0) + (maintenancePrices[maintenanceValue] || 0);
        monthlyNote.textContent = aiBetaIsActive && aiValue !== "nej"
          ? "Betarabatt denna månad; därefter " + formatSek(regularMonthly) + "/mån."
          : "";
      }
    }

    function advanceFromChoice(input) {
      if (!input || !input.checked) return;
      if (input.name === "paket") goToStage("ai", true);
      if (input.name === "ai") goToStage("maintenance", true);
      if (input.name === "underhall") goToStage("contact", true);
    }

    builder.addEventListener("change", function (event) {
      syncBuilder();
      advanceFromChoice(event.target);
    });

    // A radio input does not fire "change" when the visitor chooses the
    // already-selected option after using a back button. Bind directly to
    // each visible card, so a click anywhere on that card advances the wizard.
    builder.querySelectorAll(".project-choice-card").forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("[data-choice-info]")) return;
        var input = card.querySelector("input[name='paket'], input[name='ai'], input[name='underhall']");
        if (!input) return;
        if (!input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
        syncBuilder();
        advanceFromChoice(input);
      });
    });
    // "Läs mer" is a separate, non-selecting control. It must never choose
    // a card or advance the wizard when the visitor only wants information.
    builder.querySelectorAll("[data-choice-info]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var key = button.getAttribute("data-choice-info");
        var step = button.closest("[data-builder-step]");
        if (!step || !key) return;
        var details = step.querySelector("[data-choice-details]");
        var panel = step.querySelector('[data-choice-panel="' + key + '"]');
        var isOpen = button.getAttribute("aria-expanded") === "true";
        step.querySelectorAll("[data-choice-info]").forEach(function (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
          var icon = otherButton.querySelector("[aria-hidden='true']");
          if (icon) icon.textContent = "+";
        });
        step.querySelectorAll("[data-choice-panel]").forEach(function (otherPanel) {
          otherPanel.hidden = true;
        });
        if (!details || !panel || isOpen) {
          if (details) details.hidden = true;
          return;
        }
        panel.hidden = false;
        details.hidden = false;
        button.setAttribute("aria-expanded", "true");
        var buttonIcon = button.querySelector("[aria-hidden='true']");
        if (buttonIcon) buttonIcon.textContent = "−";
      });
    });
    builder.querySelectorAll("[data-builder-back]").forEach(function (button) {
      button.addEventListener("click", function () {
        goToStage(button.getAttribute("data-builder-back"), true);
      });
    });
    builder.addEventListener("reset", function () {
      window.setTimeout(function () {
        goToStage("package", false);
      }, 0);
    });
    syncAiBetaPresentation();
    goToStage("package", false);
  });

  /* ---------- Formulär-POST (alla [data-form]) ---------- */
  function showStatus(form, kind, message) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.hidden = false; // ta bort ev. hidden-attribut i HTML
    status.className = "form-status is-visible form-status--" + kind;
    status.textContent = message;
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideStatus(form) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.className = "form-status";
  }

  /* Stripe skickar tillbaka besökaren hit när Checkout avbryts. Ge ett
     tydligt, lokalt besked utan att antyda att en betalning har genomförts. */
  (function showCheckoutReturnStatus() {
    var form = document.querySelector("form[data-project-builder]");
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    if (["avbruten", "cancelled"].includes(params.get("checkout"))) {
      showStatus(form, "info", "Checkout avbröts. Inget har debiterats. Du kan välja paket igen nedan.");
    }
  })();

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      hideStatus(form);

      var btn = form.querySelector('button[type="submit"]');
      var originalLabel = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.classList.add("is-loading");
        btn.textContent = form.matches("[data-project-builder]") ? "Öppnar checkout…" : "Skickar…";
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });
      data.site = LEAD_SITE_KEY;
      data.timestamp = new Date().toISOString();

      try {
        var isCheckout = form.matches("[data-project-builder]");
        var endpoint = isCheckout ? form.getAttribute("data-checkout-endpoint") : FORM_ENDPOINT;
        if (!endpoint) throw new Error("CHECKOUT_ENDPOINT_MISSING");
        var payload = isCheckout ? {
          choices: {
            website: data.paket,
            ai: data.ai,
            maintenance: data.underhall
          },
          contact: {
            company: data.foretag,
            contactName: data.kontaktperson,
            phone: data.telefon,
            email: data.epost
          }
        } : data;
        var res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (isCheckout) {
          var checkout = await res.json();
          if (!checkout || typeof checkout.url !== "string" || !/^https:\/\//.test(checkout.url)) {
            throw new Error("CHECKOUT_URL_MISSING");
          }
          window.location.assign(checkout.url);
          return;
        }
        showStatus(
          form,
          "success",
          "Tack! Din förfrågan är skickad. Vi återkommer inom 1 arbetsdag."
        );
        form.reset();
        // Återställ villkorade fält efter reset
        document.querySelectorAll("[data-show]").forEach(function (group) {
          var target = document.querySelector(group.getAttribute("data-show"));
          if (target) target.hidden = true;
        });
      } catch (err) {
        showStatus(
          form,
          "error",
          form.matches("[data-project-builder]")
            ? "Checkout kunde inte öppnas just nu. Ingen betalning har genomförts. Försök igen eller kontakta oss så hjälper vi dig."
            : "Något gick fel vid skickningen. Ring oss på +46 70 494 90 87 eller mejla vberg024@gmail.com så hjälper vi dig direkt."
        );
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("is-loading");
          btn.textContent = originalLabel;
        }
      }
    });
  });
})();
