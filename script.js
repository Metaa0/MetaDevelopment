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
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

// Highlight the nav link for the section in view.
const navLinks = [...nav.querySelectorAll("a")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });
}

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

// Videos play in place (privacy-enhanced YouTube player). One at a time; the poster link
// stays as the no-JavaScript fallback.
const players = [...document.querySelectorAll("[data-video]")];
const stopPlayer = (player) => {
  if (!player.posterHTML) return;
  player.innerHTML = player.posterHTML;
  player.posterHTML = "";
  player.classList.remove("is-playing");
};
const playVideo = (player) => {
  if (player.classList.contains("is-playing")) return;
  players.forEach((other) => other !== player && stopPlayer(other));
  document.querySelectorAll("video").forEach((video) => video.pause());
  player.posterHTML = player.innerHTML;
  const frame = document.createElement("iframe");
  frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(player.dataset.video)}?autoplay=1&rel=0&playsinline=1`;
  frame.title = `${player.dataset.title} video`;
  frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  frame.allowFullscreen = true;
  player.replaceChildren(frame);
  player.classList.add("is-playing");
  frame.focus();
};
players.forEach((player) => {
  player.addEventListener("click", (event) => {
    if (!event.target.closest(".player-poster")) return;
    event.preventDefault();
    playVideo(player);
  });
});
// Starting a local clip stops any other clip or embed.
document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    players.forEach(stopPlayer);
    document.querySelectorAll("video").forEach((other) => other !== video && other.pause());
  });
});

// Live Roblox game statistics (Roblox, then RoProxy). Dashes stay if both fail.
// Each game is fetched once, however many cards show it.
const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const gameRequests = new Map();
const fetchGame = (universeId) => {
  if (!gameRequests.has(universeId)) {
    gameRequests.set(universeId, (async () => {
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
      return game;
    })());
  }
  return gameRequests.get(universeId);
};
document.querySelectorAll("[data-roblox-experience]").forEach(async (card) => {
  const updateNote = card.querySelector("[data-roblox-updated]");
  try {
    const game = await fetchGame(card.dataset.robloxExperience);
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

// Showcase arc: cards drift sideways and curve away from the centre, like the inside of a ring.
// Pauses on hover/focus, off-screen, in hidden tabs and with the pause button.
// Reduced motion keeps the curve but never moves.
const arc = document.querySelector("[data-arc]");
if (arc) {
  const track = arc.querySelector("[data-arc-track]");
  const pauseButton = document.querySelector("[data-arc-pause]");
  const originals = [...track.children];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SPEED = 36; // px per second
  let setWidth = 0;
  let offset = 0;
  let last = 0;
  let frame = 0;
  let onScreen = true;
  let hovered = false;
  let userPaused = false;

  // Clone enough copies to cover two viewport widths, so the wrap point is never visible.
  const fillTrack = () => {
    track.querySelectorAll("[data-arc-clone]").forEach((clone) => clone.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setWidth = originals.reduce((sum, card) => sum + card.offsetWidth + gap, 0);
    const copies = Math.ceil((arc.clientWidth * 2) / setWidth);
    for (let i = 0; i < copies; i += 1) {
      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.arcClone = "";
        clone.setAttribute("aria-hidden", "true");
        clone.querySelector("a").tabIndex = -1;
        track.append(clone);
      });
    }
  };

  const curve = () => {
    const box = arc.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    const half = box.width / 2;
    for (const card of track.children) {
      const rect = card.getBoundingClientRect();
      const d = Math.max(-1.3, Math.min(1.3, (rect.left + rect.width / 2 - centre) / half));
      card.style.transform = `perspective(900px) rotateY(${(-d * 26).toFixed(2)}deg) scale(${(1 + 0.32 * d * d).toFixed(3)})`;
    }
  };

  const running = () => !reducedMotion.matches && onScreen && !hovered && !userPaused && !document.hidden;
  const tick = (now) => {
    const dt = last ? Math.min(now - last, 64) / 1000 : 0;
    last = now;
    offset = (offset + SPEED * dt) % setWidth;
    track.style.transform = `translateX(${-offset}px)`;
    curve();
    frame = running() ? requestAnimationFrame(tick) : 0;
  };
  const sync = () => {
    if (running() && !frame) {
      last = 0;
      frame = requestAnimationFrame(tick);
    } else if (!running() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    pauseButton.hidden = reducedMotion.matches;
  };

  fillTrack();
  curve();
  arc.addEventListener("pointerenter", () => { hovered = true; sync(); });
  arc.addEventListener("pointerleave", () => { hovered = false; sync(); });
  arc.addEventListener("focusin", () => { hovered = true; sync(); });
  arc.addEventListener("focusout", () => { hovered = false; sync(); });
  pauseButton.addEventListener("click", () => {
    userPaused = !userPaused;
    pauseButton.setAttribute("aria-pressed", String(userPaused));
    pauseButton.textContent = userPaused ? "Play" : "Pause";
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }).observe(arc);
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { fillTrack(); curve(); }, 150);
  });
  sync();
}

document.querySelector("[data-current-year]").textContent = new Date().getFullYear();

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
