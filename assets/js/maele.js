/* ==========================================================================
   Collège Maele — scripts communs
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove("no-js");
  var ROOT = root.getAttribute("data-root") || "./";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function normalize(str) {
    return String(str).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  /* ---------- Année du pied de page ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- En-tête : ombre au défilement + bouton haut de page ---------- */
  var header = $(".site-header");
  var toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Menu mobile ---------- */
  var drawer = $("#drawer");
  var navToggle = $(".nav-toggle");
  var lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocus = doc.activeElement;
    drawer.hidden = false;
    void drawer.offsetWidth; // force le rendu avant la transition
    drawer.classList.add("is-open");
    navToggle && navToggle.setAttribute("aria-expanded", "true");
    doc.body.classList.add("no-scroll");
    var c = $(".drawer__close", drawer);
    if (c) c.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("no-scroll");
    setTimeout(function () { drawer.hidden = true; }, 320);
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && navToggle) {
    navToggle.addEventListener("click", openDrawer);
    $$("[data-drawer-close]", drawer).forEach(function (el) { el.addEventListener("click", closeDrawer); });
    $$("nav a", drawer).forEach(function (a) { a.addEventListener("click", closeDrawer); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        var f = $$("a[href], button:not([disabled])", drawer);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1100) closeDrawer(); });
  }

  /* ---------- Apparition au défilement ---------- */
  function observeReveal(els) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }
  observeReveal($$(".reveal"));

  /* ---------- Diaporama du héros ---------- */
  var hero = $("[data-hero]");
  if (hero) {
    var slides = $$(".hero__slide", hero);
    var dots = $$(".hero__dot", hero);
    var pauseBtn = $(".hero__pause", hero);
    var current = 0, timer = null, paused = reduceMotion;
    function show(i) {
      slides[current].classList.remove("is-active");
      dots[current] && dots[current].setAttribute("aria-current", "false");
      current = (i + slides.length) % slides.length;
      var img = slides[current];
      if (img.dataset.src && !img.getAttribute("src")) img.src = img.dataset.src;
      img.classList.add("is-active");
      dots[current] && dots[current].setAttribute("aria-current", "true");
      var next = slides[(current + 1) % slides.length];
      if (next.dataset.src && !next.getAttribute("src")) next.src = next.dataset.src;
    }
    function play() { stop(); if (!paused) timer = setInterval(function () { show(current + 1); }, 6500); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function setPaused(p) {
      paused = p;
      if (pauseBtn) {
        pauseBtn.setAttribute("aria-label", p ? "Reprendre le diaporama" : "Mettre le diaporama en pause");
        pauseBtn.innerHTML = '<i class="fa-solid ' + (p ? "fa-play" : "fa-pause") + '" aria-hidden="true"></i>';
      }
      p ? stop() : play();
    }
    dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); play(); }); });
    pauseBtn && pauseBtn.addEventListener("click", function () { setPaused(!paused); });
    doc.addEventListener("visibilitychange", function () { doc.hidden ? stop() : play(); });
    if (slides.length > 1) { show(0); setPaused(paused); }
  }

  /* ---------- Boîtes de dialogue natives ---------- */
  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute("open", "");
    doc.body.classList.add("no-scroll");
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }
  $$("dialog").forEach(function (dlg) {
    dlg.addEventListener("close", function () {
      if (!$("dialog[open]")) doc.body.classList.remove("no-scroll");
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg && !dlg.classList.contains("lightbox")) closeDialog(dlg);
    });
  });
  doc.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-dialog-open]");
    if (opener) {
      e.preventDefault();
      var current = opener.closest("dialog");
      if (current) closeDialog(current);
      openDialog(doc.getElementById(opener.getAttribute("data-dialog-open")));
      return;
    }
    var closer = e.target.closest("[data-dialog-close]");
    if (closer) closeDialog(closer.closest("dialog"));
  });

  /* ---------- Copier dans le presse-papiers ---------- */
  doc.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn || !navigator.clipboard) return;
    var original = btn.innerHTML;
    navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
      btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copié';
      setTimeout(function () { btn.innerHTML = original; }, 1600);
    });
  });

  /* ---------- Visionneuse d'images ---------- */
  var lightbox = null, lbItems = [], lbIndex = 0;
  function buildLightbox() {
    lightbox = doc.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-label", "Visionneuse de photos");
    lightbox.innerHTML =
      '<div class="lightbox__inner">' +
        '<div class="lightbox__top"><span class="lightbox__counter" aria-live="polite"></span>' +
        '<button type="button" class="lb-btn" data-lb="close" aria-label="Fermer la visionneuse"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
        '<div class="lightbox__stage">' +
          '<button type="button" class="lb-btn lightbox__prev" data-lb="prev" aria-label="Photo précédente"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
          '<img alt="">' +
          '<button type="button" class="lb-btn lightbox__next" data-lb="next" aria-label="Photo suivante"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="lightbox__caption"><strong></strong><span></span></div>' +
      '</div>';
    doc.body.appendChild(lightbox);
    lightbox.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lb]");
      if (b) {
        var a = b.getAttribute("data-lb");
        if (a === "close") closeDialog(lightbox);
        if (a === "prev") lbShow(lbIndex - 1);
        if (a === "next") lbShow(lbIndex + 1);
      } else if (e.target.classList.contains("lightbox__stage")) closeDialog(lightbox);
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
      if (e.key === "ArrowRight") lbShow(lbIndex + 1);
    });
    var startX = null;
    lightbox.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
      startX = null;
    });
    lightbox.addEventListener("close", function () { if (!$("dialog[open]")) doc.body.classList.remove("no-scroll"); });
  }
  function lbShow(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbIndex];
    var img = $("img", lightbox);
    img.src = it.getAttribute("data-full");
    img.alt = it.getAttribute("data-alt") || it.getAttribute("data-title") || "";
    $(".lightbox__caption strong", lightbox).textContent = it.getAttribute("data-title") || "";
    $(".lightbox__caption span", lightbox).textContent = it.getAttribute("data-desc") || "";
    $(".lightbox__counter", lightbox).textContent = (lbIndex + 1) + " / " + lbItems.length;
    var multi = lbItems.length > 1;
    $(".lightbox__prev", lightbox).hidden = !multi;
    $(".lightbox__next", lightbox).hidden = !multi;
  }
  doc.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    e.preventDefault();
    if (!lightbox) buildLightbox();
    var group = trigger.getAttribute("data-lightbox");
    lbItems = $$('[data-lightbox="' + group + '"]').filter(function (el) { return !el.closest("[hidden]"); });
    openDialog(lightbox);
    lbShow(lbItems.indexOf(trigger));
  });

  /* ---------- Filtres de la galerie ---------- */
  var gFilter = $("[data-gallery-filter]");
  if (gFilter) {
    var gItems = $$(".gallery-item");
    var gStatus = $("[data-gallery-status]");
    gFilter.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter]");
      if (!chip) return;
      var cat = chip.getAttribute("data-filter");
      var n = 0;
      gItems.forEach(function (it) {
        var show = !cat || it.getAttribute("data-cat") === cat;
        it.hidden = !show;
        if (show) n++;
      });
      $$("[data-filter]", gFilter).forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      if (gStatus) gStatus.textContent = n + (n > 1 ? " photos" : " photo");
    });
  }

  /* ---------- Fil Facebook chargé à la demande ---------- */
  var fb = $("[data-fb-lazy]");
  if (fb) {
    var loadFb = function () {
      if (doc.getElementById("facebook-jssdk")) return;
      var s = doc.createElement("script");
      s.id = "facebook-jssdk"; s.async = true; s.defer = true; s.crossOrigin = "anonymous";
      s.src = "https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v19.0";
      doc.body.appendChild(s);
    };
    if ("IntersectionObserver" in window) {
      var fio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { loadFb(); fio.disconnect(); }
      }, { rootMargin: "400px" });
      fio.observe(fb);
    } else loadFb();
  }

  /* ---------- Hymne : copier / télécharger les paroles ---------- */
  var lyrics = $("#lyrics-text");
  var lyricsText = lyrics ? "La Maélienne — Hymne du Collège Maele\n\n" + $$(".verse__body p", lyrics).map(function (p) {
    return p.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\n\s+/g, "\n").trim();
  }).join("\n\n") + "\n" : "";
  var dl = $("#download-lyrics");
  if (lyrics && dl) {
    dl.href = URL.createObjectURL(new Blob([lyricsText], { type: "text/plain;charset=utf-8" }));
  }
  var copyLyrics = $("#copy-lyrics");
  if (lyrics && copyLyrics && navigator.clipboard) {
    copyLyrics.addEventListener("click", function () {
      navigator.clipboard.writeText(lyricsText).then(function () {
        copyLyrics.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Paroles copiées';
        setTimeout(function () { copyLyrics.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copier les paroles'; }, 1600);
      });
    });
  }

  /* ==========================================================================
     Équipe enseignante
     ========================================================================== */
  var EQ = window.MAELE_EQUIPE;

  function teacherCard(p) {
    var dept = p.departements[0] ? EQ.departements[p.departements[0]].label : "";
    var prenom = [p.titre, p.prenom].filter(Boolean).join(" ");
    return '<button type="button" class="teacher" data-teacher="' + p.id + '" aria-label="Voir le profil de ' + esc(p.nomComplet) + '">' +
      '<span class="teacher__photo">' +
        (dept ? '<span class="teacher__dept">' + esc(dept) + "</span>" : "") +
        '<img src="' + ROOT + p.portrait + '" alt="" loading="lazy" width="480" height="600">' +
      "</span>" +
      '<span class="teacher__body">' +
        '<span class="teacher__name">' + esc(prenom) + " <b>" + esc(p.nom) + "</b></span>" +
        '<span class="teacher__subject">' + esc(p.libelle) + "</span>" +
        '<span class="teacher__more">Voir le profil <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
      "</span></button>";
  }

  var ARTICLES = {
    "Anglais": "l’anglais", "Français": "le français", "Latin": "le latin", "Mathématiques": "les mathématiques",
    "Physique": "la physique", "Chimie": "la chimie", "SVT": "les SVT", "Technologie": "la technologie",
    "Histoire": "l’histoire", "Géographie": "la géographie", "Dessin": "le dessin", "Dessin scientifique": "le dessin scientifique",
    "TIC": "les TIC", "Éducation à la vie": "l’éducation à la vie", "Catéchèse": "la catéchèse", "Religion": "la religion",
    "Éducation physique": "l’éducation physique"
  };
  function avecArticle(m) { return ARTICLES[m] || m; }

  var profileDlg = $("#teacher-profile");
  var profileList = [];
  var profileIndex = 0;
  function showProfile(i) {
    if (!profileDlg || !profileList.length) return;
    profileIndex = (i + profileList.length) % profileList.length;
    var p = profileList[profileIndex];
    $("[data-p-photo]", profileDlg).src = ROOT + p.portrait;
    $("[data-p-photo]", profileDlg).alt = "Portrait de " + p.nomComplet;
    $("[data-p-name]", profileDlg).textContent = p.nomComplet;
    $("[data-p-tags]", profileDlg).innerHTML =
      p.departements.map(function (d) { return '<span class="tag tag--gold">' + esc(EQ.departements[d].label) + "</span>"; }).join("") +
      p.matieres.map(function (m) { return '<span class="tag">' + esc(m) + "</span>"; }).join("");
    var enc = p.departements.indexOf("encadrement") !== -1 && p.departements.length === 1;
    $("[data-p-text]", profileDlg).textContent = enc
      ? p.nomComplet + " fait partie de l’équipe d’encadrement du Collège Maele (" + p.libelle.toLowerCase() + ")."
      : p.nomComplet + " enseigne " + p.matieres.map(avecArticle).join(", ").replace(/, ([^,]*)$/, " et $1") + " au Collège Maele et accompagne les élèves dans leur parcours.";
    var ctx = $("[data-p-context]", profileDlg);
    ctx.src = ROOT + p.photo;
    ctx.alt = p.nomComplet + " au Collège Maele";
    $("[data-p-pos]", profileDlg).textContent = (profileIndex + 1) + " / " + profileList.length;
  }
  if (profileDlg) {
    $("[data-p-prev]", profileDlg).addEventListener("click", function () { showProfile(profileIndex - 1); });
    $("[data-p-next]", profileDlg).addEventListener("click", function () { showProfile(profileIndex + 1); });
    profileDlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") showProfile(profileIndex - 1);
      if (e.key === "ArrowRight") showProfile(profileIndex + 1);
    });
  }
  function bindProfiles(container, getList) {
    container.addEventListener("click", function (e) {
      var card = e.target.closest("[data-teacher]");
      if (!card || !profileDlg) return;
      profileList = getList();
      var id = Number(card.getAttribute("data-teacher"));
      var idx = profileList.findIndex(function (p) { return p.id === id; });
      showProfile(idx < 0 ? 0 : idx);
      openDialog(profileDlg);
    });
  }

  /* Aperçu sur l'accueil */
  var preview = $("#faculty-preview");
  if (EQ && preview) {
    var count = Number(preview.getAttribute("data-count") || 10);
    // Sélection répartie sur l'ensemble de l'annuaire (hors encadrement), dans l'ordre alphabétique.
    var pool = EQ.professeurs.filter(function (p) { return p.departements.indexOf("encadrement") === -1; });
    var picked = [];
    for (var k = 0; k < Math.min(count, pool.length); k++) picked.push(pool[Math.floor(k * pool.length / count)]);
    preview.innerHTML = picked.map(teacherCard).join("");
    bindProfiles(preview, function () { return picked; });
  }

  /* Annuaire complet */
  var directory = $("#faculty-directory");
  if (EQ && directory) {
    var chipsWrap = $("#dept-chips");
    var search = $("#faculty-search");
    var sort = $("#faculty-sort");
    var status = $("#faculty-status");
    var empty = $("#faculty-empty");
    var active = "";
    var visible = [];

    var deptKeys = Object.keys(EQ.departements);
    chipsWrap.innerHTML = '<button type="button" class="chip" data-dept="" aria-pressed="true">Tous</button>' +
      deptKeys.map(function (k) {
        return '<button type="button" class="chip" data-dept="' + k + '" aria-pressed="false"><i class="fa-solid ' + EQ.departements[k].icon + '" aria-hidden="true"></i>' + esc(EQ.departements[k].label) + "</button>";
      }).join("");

    var hash = (location.hash || "").replace("#", "");
    if (hash && EQ.departements[hash]) active = hash;

    function render() {
      var q = normalize((search.value || "").trim());
      var list = EQ.professeurs.filter(function (p) {
        var okDept = !active || p.departements.indexOf(active) !== -1;
        var hay = normalize(p.nomComplet + " " + p.matieres.join(" ") + " " + p.departements.map(function (d) { return EQ.departements[d].label; }).join(" "));
        return okDept && (!q || hay.indexOf(q) !== -1);
      });
      if (sort.value === "prenom") list.sort(function (a, b) { return (a.prenom || a.nom).localeCompare(b.prenom || b.nom, "fr"); });
      if (sort.value === "matiere") list.sort(function (a, b) { return a.matieres[0].localeCompare(b.matieres[0], "fr") || a.nom.localeCompare(b.nom, "fr"); });
      visible = list;
      directory.innerHTML = list.map(teacherCard).join("");
      empty.hidden = list.length !== 0;
      var label = active ? " · " + EQ.departements[active].label : "";
      status.textContent = list.length + (list.length > 1 ? " membres affichés" : " membre affiché") + label;
      $$(".chip", chipsWrap).forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-dept") === active)); });
    }
    chipsWrap.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      active = c.getAttribute("data-dept");
      if (history.replaceState) history.replaceState(null, "", active ? "#" + active : location.pathname);
      render();
    });
    var t;
    search.addEventListener("input", function () { clearTimeout(t); t = setTimeout(render, 120); });
    sort.addEventListener("change", render);
    $$("[data-faculty-reset]").forEach(function (b) {
      b.addEventListener("click", function () { search.value = ""; sort.value = "nom"; active = ""; render(); search.focus(); });
    });
    $$("[data-dept-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        active = a.getAttribute("data-dept-link");
        render();
        $("#corps-enseignant").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    bindProfiles(directory, function () { return visible; });
    render();
  }

  /* ==========================================================================
     Formulaire de contact (Web3Forms)
     ========================================================================== */
  var contactForm = $("#contact-form");
  if (contactForm) {
    // Préremplit le motif depuis l'URL (ex. contact.html?motif=inscription)
    var motif = new URLSearchParams(location.search).get("motif");
    var topicSel = contactForm.elements.namedItem("topic");
    if (motif && topicSel && $('option[value="' + motif.replace(/[^a-z]/g, "") + '"]', topicSel)) topicSel.value = motif;
    var feedback = $("#form-feedback");
    var submitBtn = $("button[type=submit]", contactForm);
    var btnHtml = submitBtn.innerHTML;
    var rules = {
      firstname: function (v) { return v ? "" : "Indiquez votre prénom."; },
      lastname: function (v) { return v ? "" : "Indiquez votre nom."; },
      email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Adresse e-mail invalide (ex. nom@domaine.com)."; },
      topic: function (v) { return v ? "" : "Choisissez le motif de votre demande."; },
      message: function (v) { return v.length >= 20 ? "" : "Votre message doit contenir au moins 20 caractères (" + v.length + "/20)."; }
    };
    function validateField(name) {
      var field = contactForm.elements.namedItem(name);
      var err = rules[name](field.value.trim());
      var holder = $("#" + name + "-error");
      field.setAttribute("aria-invalid", err ? "true" : "false");
      if (holder) holder.textContent = err;
      return !err;
    }
    Object.keys(rules).forEach(function (name) {
      var field = contactForm.elements.namedItem(name);
      field.addEventListener("blur", function () { if (field.value.trim() || field.getAttribute("aria-invalid")) validateField(name); });
      field.addEventListener("input", function () { if (field.getAttribute("aria-invalid") === "true") validateField(name); });
    });
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      feedback.className = "alert"; feedback.textContent = "";
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name) && !firstInvalid) firstInvalid = contactForm.elements.namedItem(name);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours…';
      fetch(contactForm.action, { method: "POST", body: new FormData(contactForm), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (!res.ok || res.data.success === false) throw new Error(res.data.message || "");
          feedback.className = "alert alert--success";
          feedback.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>Merci, votre message a bien été envoyé. Nous vous répondrons sous 24 à 48 heures ouvrées.</span>';
          contactForm.reset();
          $$("[aria-invalid]", contactForm).forEach(function (f) { f.removeAttribute("aria-invalid"); });
        })
        .catch(function () {
          feedback.className = "alert alert--error";
          feedback.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span>L’envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous directement à contact@college-maele.com.</span>';
        })
        .then(function () { submitBtn.disabled = false; submitBtn.innerHTML = btnHtml; feedback.focus(); });
    });
  }

  /* ==========================================================================
     Soumission d'article (éditeur Quill)
     ========================================================================== */
  var articleForm = $("#article-form");
  if (articleForm) {
    var contentField = $("#corps-article");
    var editorShell = $("#editor-shell");
    var editorError = $("#editor-error");
    var quill = null;
    function initEditor() {
      if (!window.Quill || !editorShell) return;
      quill = new window.Quill("#article-editor", {
        theme: "snow",
        placeholder: "Rédigez votre article ici. Sélectionnez du texte pour le mettre en forme…",
        modules: {
          toolbar: {
            container: [[{ header: [2, 3, false] }], ["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link", "image"], ["clean"]],
            handlers: {
              image: function () {
                var url = window.prompt("Collez le lien public de l’image (https://…)");
                if (!url) return;
                if (!/^https?:\/\//i.test(url.trim())) { window.alert("Le lien doit commencer par http:// ou https://"); return; }
                var range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", url.trim(), "user");
              }
            }
          }
        }
      });
      contentField.required = false;
      contentField.hidden = true;
      editorShell.hidden = false;
      quill.on("text-change", function () { contentField.value = quill.root.innerHTML; editorError.textContent = ""; });
    }
    if (window.Quill) initEditor(); else window.addEventListener("load", initEditor);
    articleForm.addEventListener("submit", function (e) {
      if (quill) {
        contentField.value = quill.root.innerHTML;
        if (!quill.getText().trim()) {
          e.preventDefault();
          editorError.textContent = "Rédigez le contenu de votre article avant de l’envoyer.";
          quill.focus();
          return;
        }
      }
      var b = $("button[type=submit]", articleForm);
      b.disabled = true;
      b.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours…';
    });
  }
})();
