const root = document.documentElement;
root.classList.add("js");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const progress = document.querySelector("[data-scroll-progress]");
const toast = document.querySelector("[data-copy-toast]");

const closeMenu = () => {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
};

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener("focusout", () => {
  requestAnimationFrame(() => {
    if (!header.contains(document.activeElement)) closeMenu();
  });
});
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      toast.textContent = `Copied @${value}`;
      toast.classList.add("is-visible");
      window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
    } catch {
      window.prompt("Copy Discord username:", value);
    }
  });
});

document.querySelectorAll(".faq details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq details[open]").forEach((item) => {
      if (item !== detail) item.open = false;
    });
  });
});

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

document.querySelectorAll("[data-roblox-experience]").forEach(async (card) => {
  const universeId = card.dataset.robloxExperience;
  const updateNote = card.querySelector("[data-roblox-updated]");

  try {
    const query = `universeIds=${encodeURIComponent(universeId)}`;
    const endpoints = [
      `https://games.roblox.com/v1/games?${query}`,
      `https://games.roproxy.com/v1/games?${query}`,
    ];
    let response;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
        if (response.ok) break;
      } catch {}
    }
    if (!response?.ok) throw new Error("Roblox stats were unavailable");

    const payload = await response.json();
    const game = payload.data?.[0];
    if (!game || !["playing", "visits", "maxPlayers"].every((key) => Number.isFinite(game[key]))) {
      throw new Error("Roblox game data was incomplete");
    }

    card.querySelectorAll("[data-roblox-stat]").forEach((element) => {
      const value = game[element.dataset.robloxStat];
      if (Number.isFinite(value)) {
        element.textContent = compactNumber.format(value);
        element.title = value.toLocaleString("en");
      }
    });

    if (updateNote) {
      updateNote.textContent = `Live Roblox stats · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  } catch {
    if (updateNote) updateNote.textContent = "Game statistics are unavailable right now. You can still play on Roblox.";
  }
});

document.querySelector("[data-current-year]").textContent = new Date().getFullYear();

// User-controlled project previews; the default project also works without JavaScript.
const showcases = {
  simulator: {
    title: "Connected Simulator Framework",
    image: "https://i.ytimg.com/vi/V_LcqUnQkLE/hqdefault.jpg",
    alt: "Connected simulator systems gameplay demo",
    url: "https://youtu.be/V_LcqUnQkLE",
    label: "RECORDED GAMEPLAY DEMO",
    category: "ECONOMY · INVENTORY · WORLD SYSTEMS",
    description: "Placement, inventory and a working economy connected into one player loop.",
  },
  combat: {
    title: "Combat Mechanics",
    image: "https://i.ytimg.com/vi/m7pZJbzlLj0/hqdefault.jpg",
    alt: "Combat mechanics gameplay demo",
    url: "https://youtu.be/m7pZJbzlLj0",
    label: "RECORDED GAMEPLAY DEMO",
    category: "COMBAT · HIT FEEDBACK · TIMING",
    description: "Melee timing, hit feedback and a deliberate response to player input.",
  },
  keyboard: {
    title: "Keyboard ASMR System",
    image: "https://i.ytimg.com/vi/C5oBTtvQghE/hqdefault.jpg",
    alt: "Keyboard input and audio gameplay demo",
    url: "https://youtu.be/C5oBTtvQghE",
    label: "RECORDED GAMEPLAY DEMO",
    category: "INPUT · AUDIO · GAME FEEL",
    description: "Every key press connected to sound, animation and progression feedback.",
  },
  hoverboard: {
    title: "Hoverboard Obby",
    image: "assets/hoverboard-obby-icon.png",
    alt: "Obby But You're on a Hoverboard project artwork",
    url: "https://youtu.be/lEorSYMsxoU",
    label: "PLAYABLE ROBLOX EXPERIENCE",
    category: "MOVEMENT · PROGRESSION · REWARDS",
    description: "Hoverboard traversal, distinct worlds and a connected progression loop.",
  },
};
document.querySelector("[data-showcase-controls]").hidden = false;
document.querySelectorAll("[data-showcase]").forEach((button) => {
  button.addEventListener("click", () => {
    const project = showcases[button.dataset.showcase];
    const image = document.querySelector("[data-showcase-image]");
    const link = document.querySelector("[data-showcase-link]");
    if (root.dataset.motion === "running") {
      image.getAnimations().forEach((animation) => animation.cancel());
      image.animate([{ opacity: .35, scale: "1.025" }, { opacity: 1, scale: "1" }], { duration: 320, easing: "ease-out" });
    }
    image.src = project.image;
    image.alt = project.alt;
    link.href = project.url;
    link.setAttribute("aria-label", `Watch ${project.title} showcase on YouTube`);
    link.classList.toggle("showcase-art--icon", button.dataset.showcase === "hoverboard");
    ["title", "label", "category", "description"].forEach((field) => {
      document.querySelector(`[data-showcase-${field}]`).textContent = project[field];
    });
    document.querySelectorAll("[data-showcase]").forEach((control) => {
      control.setAttribute("aria-pressed", String(control === button));
    });
  });
});

// Carry pricing intent into the real enquiry; never replace a visitor's written brief.
const enquiryForm = document.querySelector(".contact-form");
const scopeNote = document.querySelector("[data-selected-scope]");
document.querySelectorAll("[data-scope]").forEach((link) => {
  link.addEventListener("click", () => {
    enquiryForm.elements.selectedScope.value = link.dataset.scope;
    enquiryForm.elements.projectType.value = link.dataset.projectType;
    scopeNote.textContent = `Starting point: ${link.dataset.scope}. You can change the project type below.`;
    scopeNote.hidden = false;
  });
});
enquiryForm.elements.projectType.addEventListener("change", () => {
  enquiryForm.elements.selectedScope.value = "";
  scopeNote.hidden = true;
});

// Keep the mobile action within reach, without covering the hero or enquiry form.
const mobileQuote = document.querySelector(".mobile-quote");
if ("IntersectionObserver" in window) {
  let heroVisible = true;
  let contactVisible = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target.matches(".hero")) heroVisible = entry.isIntersecting;
      else contactVisible = entry.isIntersecting;
    });
    mobileQuote.classList.toggle("is-visible", !heroVisible && !contactVisible);
  });
  observer.observe(document.querySelector(".hero"));
  observer.observe(document.querySelector("#contact"));
}

// One shared image counter on the canonical public site only. No seeded counts,
// browser identifiers, localStorage totals or cache-busting requests.
const viewBadge = document.querySelector("[data-view-badge]");
const viewStatus = document.querySelector("[data-view-status]");
const isPublicPortfolio = location.protocol === "https:"
  && location.hostname === "metaa0.github.io"
  && /^\/MetaDevelopment\/(?:index\.html)?$/.test(location.pathname);
if (isPublicPortfolio) {
  viewStatus.textContent = "Loading count…";
  const unavailable = () => {
    viewBadge.hidden = true;
    viewStatus.hidden = false;
    viewStatus.textContent = "Count temporarily unavailable";
  };
  const timeout = setTimeout(unavailable, 8000);
  viewBadge.addEventListener("load", () => {
    clearTimeout(timeout);
    viewBadge.hidden = false;
    viewStatus.hidden = true;
  }, { once: true });
  viewBadge.addEventListener("error", () => {
    clearTimeout(timeout);
    unavailable();
  }, { once: true });
  viewBadge.referrerPolicy = "no-referrer";
  viewBadge.src = "https://hits.sh/metaa0.github.io/MetaDevelopment.svg?style=flat-square&label=views&color=6d28d9&labelColor=151519";
}

if (!isPublicPortfolio) viewStatus.textContent = "Available on the live site";

// Filter the real demo collection. All cards remain visible without JavaScript.
const demoCards = [...document.querySelectorAll("[data-demo-category]")];
const demoCount = document.querySelector("[data-demo-count]");
document.querySelector("[data-demo-toolbar]").hidden = false;
document.querySelectorAll("[data-demo-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.demoFilter;
    demoCards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.demoCategory !== category;
    });
    document.querySelectorAll("[data-demo-filter]").forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    const count = demoCards.filter((card) => !card.hidden).length;
    demoCount.textContent = category === "all" ? "Showing all 7 demos" : "Showing " + count + " demos";
    document.dispatchEvent(new Event("meta:content-change"));
  });
});
