(function () {
  "use strict";

  var VALID_TABS = [
    "home",
    "projects",
    "research",
    "experience",
    "volunteering",
    "achievements",
    "contact"
  ];

  function setActiveNav(tabId) {
    var buttons = document.querySelectorAll("[data-tab-target]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isMatch = btn.getAttribute("data-tab-target") === tabId;
      if (btn.classList.contains("nav-tab-btn")) {
        btn.classList.toggle("active", isMatch);
        btn.setAttribute("aria-selected", isMatch ? "true" : "false");
      }
    }
  }

  function scrollToSection(tabId, updateHash) {
    if (VALID_TABS.indexOf(tabId) === -1) {
      tabId = "home";
    }

    setActiveNav(tabId);

    var navMenu = document.getElementById("nav-tabs-menu");
    if (navMenu) {
      navMenu.classList.remove("mobile-open");
    }

    var targetEl = document.getElementById("panel-" + tabId);
    if (targetEl) {
      if (tabId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (updateHash) {
      if (history.replaceState) {
        history.replaceState(null, "", "#" + tabId);
      } else {
        window.location.hash = tabId;
      }
    }
  }

  function initTabs() {
    var triggers = document.querySelectorAll("[data-tab-target]");
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function (e) {
        e.preventDefault();
        var target = this.getAttribute("data-tab-target");
        scrollToSection(target, true);
      });
    }

    var mobileBtn = document.getElementById("mobile-menu-toggle");
    var navMenu = document.getElementById("nav-tabs-menu");
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener("click", function () {
        navMenu.classList.toggle("mobile-open");
      });
    }

    // Scroll-spy: update active nav item automatically while scrolling
    var ticking = false;
    function onScrollSpy() {
      var scrollPos = window.scrollY + 180;
      var currentTab = "home";
      for (var i = 0; i < VALID_TABS.length; i++) {
        var id = VALID_TABS[i];
        var el = document.getElementById("panel-" + id);
        if (el && el.offsetTop <= scrollPos) {
          currentTab = id;
        }
      }
      setActiveNav(currentTab);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(onScrollSpy);
        ticking = true;
      }
    });

    var initialHash = (window.location.hash || "").replace(/^#/, "");
    if (VALID_TABS.indexOf(initialHash) !== -1 && initialHash !== "home") {
      setTimeout(function () {
        scrollToSection(initialHash, false);
      }, 60);
    } else {
      setActiveNav("home");
    }
  }

  function initGalleries() {
    // Portrait switcher on Home tab
    var portraitThumbs = document.querySelectorAll("[data-portrait-src]");
    var mainPortrait = document.getElementById("hero-main-portrait");
    var mainPortraitCap = document.getElementById("hero-portrait-caption");
    for (var i = 0; i < portraitThumbs.length; i++) {
      portraitThumbs[i].addEventListener("click", function () {
        var newSrc = this.getAttribute("data-portrait-src");
        var newCap = this.getAttribute("data-portrait-cap");
        if (mainPortrait && newSrc) {
          mainPortrait.setAttribute("src", newSrc);
          mainPortrait.setAttribute("data-lightbox-caption", newCap || "");
        }
        if (mainPortraitCap && newCap) {
          mainPortraitCap.textContent = newCap;
        }
        for (var k = 0; k < portraitThumbs.length; k++) {
          portraitThumbs[k].classList.remove("active");
        }
        this.classList.add("active");
      });
    }

    // Project multi-image stage switcher
    var galleryButtons = document.querySelectorAll("[data-stage-target]");
    for (var j = 0; j < galleryButtons.length; j++) {
      galleryButtons[j].addEventListener("click", function () {
        var stageId = this.getAttribute("data-stage-target");
        var imgSrc = this.getAttribute("data-stage-src");
        var badgeText = this.getAttribute("data-stage-badge");
        var stageImg = document.getElementById(stageId);
        var stageBadge = document.getElementById(stageId + "-badge");
        if (stageImg && imgSrc) {
          stageImg.setAttribute("src", imgSrc);
          stageImg.setAttribute("data-lightbox-caption", badgeText || "");
        }
        if (stageBadge && badgeText) {
          stageBadge.textContent = badgeText;
        }
        var siblings = this.parentElement.querySelectorAll("[data-stage-target]");
        for (var s = 0; s < siblings.length; s++) {
          siblings[s].classList.remove("active");
        }
        this.classList.add("active");
      });
    }
  }

  function initLightbox() {
    var backdrop = document.getElementById("lightbox-modal");
    var modalImg = document.getElementById("lightbox-img");
    var modalCap = document.getElementById("lightbox-caption-text");
    var closeBtn = document.getElementById("lightbox-close-btn");

    if (!backdrop || !modalImg || !modalCap) {
      return;
    }

    function openLightbox(src, caption) {
      modalImg.setAttribute("src", src);
      modalCap.textContent = caption || "Archival photograph / screenshot";
      backdrop.classList.add("open");
      backdrop.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
      backdrop.classList.remove("open");
      backdrop.setAttribute("aria-hidden", "true");
      modalImg.setAttribute("src", "");
    }

    var zoomables = document.querySelectorAll("[data-lightbox]");
    for (var i = 0; i < zoomables.length; i++) {
      zoomables[i].addEventListener("click", function () {
        var src = this.getAttribute("src");
        var cap =
          this.getAttribute("data-lightbox-caption") ||
          this.getAttribute("alt") ||
          "";
        if (src) {
          openLightbox(src, cap);
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("open")) {
        closeLightbox();
      }
    });
  }

  function initThemeToggle() {
    var toggleBtn = document.getElementById("theme-toggle");
    var toggleLabel = document.getElementById("theme-toggle-label");
    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem("ashish_portfolio_theme");
    } catch (err) {
      savedTheme = null;
    }

    function applyTheme(mode) {
      if (mode === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        if (toggleLabel) {
          toggleLabel.textContent = "PAPER LIGHT";
        }
      } else {
        document.documentElement.removeAttribute("data-theme");
        if (toggleLabel) {
          toggleLabel.textContent = "INK DARK";
        }
      }
    }

    applyTheme(savedTheme === "dark" ? "dark" : "light");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var isDark =
          document.documentElement.getAttribute("data-theme") === "dark";
        var next = isDark ? "light" : "dark";
        applyTheme(next);
        try {
          localStorage.setItem("ashish_portfolio_theme", next);
        } catch (err) {
          // ignore storage restriction
        }
      });
    }
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var banner = document.getElementById("contact-status-banner");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("contact-name");
      var emailInput = document.getElementById("contact-email");
      var subjectInput = document.getElementById("contact-subject");
      var messageInput = document.getElementById("contact-message");

      var name = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var subject = subjectInput ? subjectInput.value.trim() : "";
      var message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !subject || !message) {
        if (banner) {
          banner.textContent = "Please complete all required fields.";
          banner.classList.add("visible");
        }
        return;
      }

      var bodyLines = [
        "From: " + name + " <" + email + ">",
        "",
        message
      ].join("\n");

      var mailtoHref =
        "mailto:ashishvish4778@gmail.com?subject=" +
        encodeURIComponent("[Portfolio] " + subject) +
        "&body=" +
        encodeURIComponent(bodyLines);

      if (banner) {
        banner.textContent =
          "Draft prepared for ashishvish4778@gmail.com — opening your mail client.";
        banner.classList.add("visible");
      }

      window.location.href = mailtoHref;
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    initGalleries();
    initLightbox();
    initThemeToggle();
    initContactForm();
  });
})();
