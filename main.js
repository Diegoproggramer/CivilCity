/* =====================================================
   CivilCity | Modern Neon Steel Interactive Core
   Author: Hadi (Diegoproggramer)
   Version: 2.0 - Fully CSP Safe
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("%c⚙️ سیویل‌سیتی با موفقیت بارگذاری شد!", "color:#00faff; font-weight:bold;");

  /* ===  نفَس نئونی هدر (Glow Pulse) === */
  const logo = document.querySelector(".logo");
  if (logo) {
    let glow = 0;
    setInterval(() => {
      glow = (glow + 1) % 100;
      const blur = 6 + 4 * Math.sin(glow * Math.PI / 50);
      logo.style.textShadow = `0 0 ${blur}px #00faff`;
    }, 80);
  }

  /* ===  افکت نئونی hover روی دکمه‌ها === */
  const buttons = document.querySelectorAll(".btn-neon");
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      btn.style.boxShadow = "0 0 25px #00faff";
      btn.style.transform = "translateY(-3px)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.boxShadow = "none";
      btn.style.transform = "translateY(0)";
    });
  });

  /* ===  انیمیشن fade-in برای کارت‌ها === */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  const cards = document.querySelectorAll(".article-card, .member-card");
  cards.forEach(card => {
    card.classList.add("hidden");
    observer.observe(card);
  });

  /* ===  دکمه بازگشت به بالا === */
  const toTop = document.createElement("div");
  toTop.innerHTML = "⬆";
  toTop.className = "to-top";
  document.body.appendChild(toTop);

  window.addEventListener("scroll", () => {
    toTop.style.opacity = window.scrollY > 200 ? "1" : "0";
  });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
