const accents = {
  violet: ["#bb8cff", "187, 140, 255"],
  lime: ["#bff45d", "191, 244, 93"],
  teal: ["#4ee4d2", "78, 228, 210"],
  coral: ["#ff8174", "255, 129, 116"],
};

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const progress = document.querySelector("[data-scroll-progress]");
const toast = document.querySelector("[data-copy-toast]");

const setAccent = (name) => {
  const selected = accents[name] || accents.violet;
  root.style.setProperty("--accent", selected[0]);
  root.style.setProperty("--accent-rgb", selected[1]);
  document.querySelectorAll("[data-accent]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.accent === name));
  });
  try { localStorage.setItem("meta-accent", name); } catch {}
};

document.querySelectorAll("[data-accent]").forEach((button) => {
  button.addEventListener("click", () => setAccent(button.dataset.accent));
});

let storedAccent = "violet";
try { storedAccent = localStorage.getItem("meta-accent") || "violet"; } catch {}
setAccent(storedAccent);

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

document.querySelector("[data-current-year]").textContent = new Date().getFullYear();
