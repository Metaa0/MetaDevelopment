const root = document.documentElement;
root.classList.add("js");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const toast = document.querySelector("[data-copy-toast]");

// Mobile menu: Escape and outside clicks close it, focus returns to the button.
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

const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Copy Discord handle.
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      toast.textContent = `Copied @${value}`;
    } catch {
      toast.textContent = `Discord: @${value}`;
    }
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  });
});

// One FAQ answer open at a time.
document.querySelectorAll(".faq details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq details[open]").forEach((item) => {
      if (item !== detail) item.open = false;
    });
  });
});

// Live Roblox game statistics (Roblox, then RoProxy). Dashes stay if both fail.
const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
document.querySelectorAll("[data-roblox-experience]").forEach(async (card) => {
  const universeId = card.dataset.robloxExperience;
  const updateNote = card.querySelector("[data-roblox-updated]");
  try {
    const query = `universeIds=${encodeURIComponent(universeId)}`;
    const endpoints = [`https://games.roblox.com/v1/games?${query}`, `https://games.roproxy.com/v1/games?${query}`];
    let response;
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
        if (response.ok) break;
      } catch {}
    }
    if (!response?.ok) throw new Error("Roblox stats were unavailable");
    const game = (await response.json()).data?.[0];
    if (!game || !["playing", "visits", "maxPlayers"].every((key) => Number.isFinite(game[key]))) {
      throw new Error("Roblox game data was incomplete");
    }
    card.querySelectorAll("[data-roblox-stat]").forEach((element) => {
      const value = game[element.dataset.robloxStat];
      element.textContent = compactNumber.format(value);
      element.title = value.toLocaleString("en");
    });
    if (updateNote) updateNote.textContent = `Live from Roblox · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    if (updateNote) updateNote.textContent = "Game statistics are unavailable right now. You can still play on Roblox.";
  }
});

document.querySelector("[data-current-year]").textContent = new Date().getFullYear();

// Mobile quote button: shown between the hero and the enquiry form only.
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

// Shared page-view counter, on the public site only. No seeded counts or identifiers.
const viewBadge = document.querySelector("[data-view-badge]");
const viewStatus = document.querySelector("[data-view-status]");
const isPublicPortfolio = location.protocol === "https:"
  && location.hostname === "metaa0.github.io"
  && /^\/MetaDevelopment\/(?:index\.html)?$/.test(location.pathname);
if (isPublicPortfolio) {
  viewStatus.textContent = "Loading…";
  const unavailable = () => {
    viewBadge.hidden = true;
    viewStatus.hidden = false;
    viewStatus.textContent = "Unavailable";
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
} else {
  viewStatus.textContent = "Shown on the live site";
}
