const siteContent = {
  capabilities: [
    {
      number: "01",
      title: "Gameplay systems",
      text: "Rounds, progression, quests, placement, tower defense, shops, rewards, and the loops that keep players moving.",
      accent: "cyan",
    },
    {
      number: "02",
      title: "Combat & weapons",
      text: "Responsive melee, ranged weapons, hit feedback, cooldowns, server validation, and combat that communicates clearly.",
      accent: "coral",
    },
    {
      number: "03",
      title: "Interface development",
      text: "Player-first HUDs, menus, inventories, shop flows, settings, and polished client-server UI behavior.",
      accent: "lime",
    },
    {
      number: "04",
      title: "Prototype to launch",
      text: "Fast playable concepts, optimization, bug fixing, release checks, and practical support after handoff.",
      accent: "violet",
    },
  ],
  works: [
    {
      title: "Anime Pulse Tower Defense",
      description: "Tower defense settings, unit configuration, and a readable player-facing setup flow.",
      video: "https://youtu.be/S0q7UuuPW18",
      tags: ["Tower defense", "Units", "UI"],
      category: "Featured / Anime Pulse",
      accent: "lime",
    },
    {
      title: "Combat Mechanics Test",
      description: "Melee timing, core combat mechanics, hit feedback, and the feel of each player input.",
      video: "https://youtu.be/m7pZJbzlLj0",
      tags: ["Combat", "Mechanics", "Feedback"],
      category: "Featured / Combat",
      accent: "coral",
    },
    {
      title: "Sniper Gun System",
      description: "Aiming, firing feedback, HUD behavior, and deliberate long-range weapon handling.",
      video: "https://youtu.be/zigIRwqCTKs",
      tags: ["Weapons", "Sniper", "HUD"],
      category: "Gun systems / 01",
      accent: "cyan",
    },
    {
      title: "AK Gun System",
      description: "Automatic weapon handling, firing flow, reload feedback, and combat UI support.",
      video: "https://youtu.be/2spQo-1RqzQ",
      tags: ["Weapons", "AK", "Combat"],
      category: "Gun systems / 02",
      accent: "violet",
    },
    {
      title: "Placement System",
      description: "Preview states, positioning feedback, validation, and player-controlled build interaction.",
      video: "https://youtu.be/V1JkN4IotAs",
      tags: ["Placement", "Build mode", "UX"],
      category: "Systems / Placement",
      accent: "lime",
    },
    {
      title: "Price Variation",
      description: "Dynamic item values, purchase states, economy feedback, and clear player decisions.",
      video: "https://youtu.be/VK_yxDhgrRE",
      tags: ["Economy", "Pricing", "UI"],
      category: "Systems / Economy",
      accent: "coral",
    },
  ],
  contribution: {
    game: "Anime Pulse",
    role: "Systems, interface flow, tower defense setup, unit configuration, pricing, and gameplay feature contribution.",
    year: "2026",
    url: "https://www.roblox.com/games/78003352287107/Anime-Pulse",
    image: "assets/anime-pulse-banner.png",
    tags: ["Live experience", "Systems", "UI", "Units"],
  },
  pricing: [
    {
      name: "Quick Fix",
      price: "$25+",
      detail: "For a contained issue or targeted improvement.",
      features: ["Single script or bug fix", "Scope confirmed first", "Fast handoff"],
    },
    {
      name: "Feature Build",
      price: "$100+",
      detail: "For a complete, polished Roblox feature.",
      features: ["Planning and implementation", "Testing pass included", "Basic documentation"],
      featured: true,
    },
    {
      name: "Playable Prototype",
      price: "$300+",
      detail: "For a core loop or connected multi-system build.",
      features: ["Milestone delivery", "Connected systems", "Support after handoff"],
    },
  ],
  discordProfiles: [
    {
      displayName: "Letriq",
      username: "notletriq",
      role: "Lead developer",
      avatar: "assets/discord-avatar.png",
      type: "image",
    },
    {
      displayName: "StepRuji",
      username: "stepruji",
      role: "Developer / programmer",
      avatar: "assets/stepruji-discord.png",
      type: "crop",
    },
  ],
};

const getYouTubeId = (value) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
    if (url.searchParams.has("v")) return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    return embedMatch ? embedMatch[1] : "";
  } catch {
    return "";
  }
};

const makeTag = (tag) => `<span class="tag">${tag}</span>`;

const videoFacade = (item) => {
  const id = getYouTubeId(item.video);
  return `
    <div class="video-facade" data-video-id="${id}" data-video-title="${item.title}">
      <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${item.title} video preview" loading="lazy" />
      <span class="video-tint"></span>
      <button class="video-play" type="button" aria-label="Play ${item.title}">
        <span aria-hidden="true"></span>
      </button>
      <a class="youtube-link" href="${item.video}" target="_blank" rel="noreferrer">YouTube &nearr;</a>
    </div>
  `;
};

const renderCapabilities = () => {
  const root = document.querySelector("[data-capabilities]");
  root.innerHTML = siteContent.capabilities
    .map(
      (item) => `
        <article class="capability-row reveal" data-accent="${item.accent}">
          <span class="capability-number">${item.number}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
          <span class="capability-arrow" aria-hidden="true">&nearr;</span>
        </article>
      `,
    )
    .join("");
};

const renderWorks = () => {
  const root = document.querySelector("[data-work-grid]");
  root.innerHTML = siteContent.works
    .map(
      (item, index) => `
        <article class="work-card reveal" data-accent="${item.accent}">
          ${videoFacade(item)}
          <div class="work-body">
            <div class="work-meta"><span>${String(index + 1).padStart(2, "0")}</span><span>${item.category}</span></div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="tag-row">${item.tags.map(makeTag).join("")}</div>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderContribution = () => {
  const item = siteContent.contribution;
  const root = document.querySelector("[data-contribution-list]");
  root.innerHTML = `
    <article class="game-feature reveal">
      <a class="game-visual" href="${item.url}" target="_blank" rel="noreferrer" aria-label="Open ${item.game} on Roblox">
        <img src="${item.image}" alt="${item.game} Roblox game artwork" />
        <span class="game-overlay"></span>
        <span class="game-live"><i></i> Live on Roblox</span>
        <span class="game-open" aria-hidden="true">&nearr;</span>
      </a>
      <div class="game-copy">
        <div class="game-year">${item.year}</div>
        <p class="eyebrow">Roblox experience</p>
        <h3>${item.game}</h3>
        <p>${item.role}</p>
        <div class="tag-row">${item.tags.map(makeTag).join("")}</div>
        <a class="button game-button" href="${item.url}" target="_blank" rel="noreferrer">Play on Roblox <span aria-hidden="true">&nearr;</span></a>
      </div>
    </article>
  `;
};

const renderPricing = () => {
  const root = document.querySelector("[data-pricing-grid]");
  root.innerHTML = siteContent.pricing
    .map(
      (item, index) => `
        <article class="price-card reveal${item.featured ? " featured" : ""}">
          <div class="price-topline"><span>0${index + 1}</span>${item.featured ? "<b>Most requested</b>" : ""}</div>
          <h3>${item.name}</h3>
          <p>${item.detail}</p>
          <div class="price">${item.price}<small>starting</small></div>
          <ul>${item.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>
          <a href="#contact">Choose this scope <span aria-hidden="true">&nearr;</span></a>
        </article>
      `,
    )
    .join("");
};

const renderDiscordProfiles = () => {
  const root = document.querySelector("[data-discord-grid]");
  root.innerHTML = siteContent.discordProfiles
    .map(
      (profile) => `
        <article class="discord-card">
          ${
            profile.type === "crop"
              ? `<span class="discord-avatar discord-avatar-crop" style="background-image:url('${profile.avatar}')" role="img" aria-label="${profile.displayName} avatar"></span>`
              : `<img class="discord-avatar" src="${profile.avatar}" alt="${profile.displayName} avatar" />`
          }
          <div>
            <strong>${profile.displayName}</strong>
            <span>@${profile.username}</span>
            <small>${profile.role}</small>
          </div>
          <button type="button" class="copy-discord" data-copy="${profile.username}" aria-label="Copy ${profile.username} Discord username">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9h10v10H9zM5 5h10v2H7v8H5z" /></svg>
          </button>
        </article>
      `,
    )
    .join("");
};

const wireVideoFacades = () => {
  document.querySelectorAll(".video-play").forEach((button) => {
    button.addEventListener("click", () => {
      const facade = button.closest("[data-video-id]");
      const { videoId, videoTitle } = facade.dataset;
      facade.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
          title="${videoTitle}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      `;
      facade.classList.add("is-playing");
    });
  });
};

const wireCarousel = () => {
  const rail = document.querySelector("[data-work-grid]");
  const progress = document.querySelector("[data-rail-progress]");
  const previous = document.querySelector("[data-scroll-prev]");
  const next = document.querySelector("[data-scroll-next]");

  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const percent = max > 0 ? (rail.scrollLeft / max) * 100 : 100;
    progress.style.width = `${Math.max(12, percent)}%`;
  };

  const move = (direction) => {
    const card = rail.querySelector(".work-card");
    rail.scrollBy({ left: direction * ((card?.offsetWidth || 360) + 18), behavior: "smooth" });
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  rail.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
};

const wireCopyButtons = () => {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Discord username copied");
        window.setTimeout(() => button.classList.remove("is-copied"), 1800);
      } catch {
        window.prompt("Copy Discord username:", button.dataset.copy);
      }
    });
  });
};

const wireNavigation = () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const button = document.querySelector("[data-menu-button]");
  const progress = document.querySelector("[data-scroll-progress]");

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };

  button.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    header.classList.toggle("is-open", open);
    button.classList.toggle("is-open", open);
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      header.classList.remove("is-open");
      button.classList.remove("is-open");
      button.setAttribute("aria-label", "Open navigation");
    });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
};

const wireReveals = () => {
  const targets = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );
  targets.forEach((target) => observer.observe(target));
};

const hydrateVisitorStats = async () => {
  const total = document.querySelector("[data-total-views]");
  const live = document.querySelector("[data-live-visitors]");
  try {
    const response = await fetch(
      "https://icount.kr/api.php?id=letriqyt.github.io",
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("Visitor counter unavailable");
    const data = await response.json();
    total.textContent = new Intl.NumberFormat("en-GB").format(data.total?.pv || 0);
    live.textContent = new Intl.NumberFormat("en-GB").format(data.realtime || 0);
  } catch {
    total.textContent = "Live";
    live.textContent = "Now";
  }
};

const init = () => {
  renderCapabilities();
  renderWorks();
  renderContribution();
  renderPricing();
  renderDiscordProfiles();
  document.querySelector("[data-current-year]").textContent = new Date().getFullYear();
  wireVideoFacades();
  wireCarousel();
  wireCopyButtons();
  wireNavigation();
  wireReveals();
  hydrateVisitorStats();

  window.addEventListener("load", () => {
    const target = window.location.hash && document.querySelector(window.location.hash);
    if (target) window.requestAnimationFrame(() => target.scrollIntoView());
  });
};

init();
