// Talaba.uz — interaktiv funksiyalar
document.addEventListener("DOMContentLoaded", () => {
  /* 1. RO'YXATDAN O'TISH FORMASI: tekshiruv, parolni ko'rsatish, parol kuchi */
  const form = document.querySelector(".register-form");

  if (form) {
    const username = form.elements.username;
    const email = form.elements.email;
    const password = form.elements.password;

    form.setAttribute("novalidate", "");

    // Har bir maydon ostiga xato matni joyi
    [username, email, password].forEach((input) => {
      const err = document.createElement("small");
      err.className = "field-error";
      input.closest(".input-group").appendChild(err);
    });

    const setError = (input, message) => {
      const group = input.closest(".input-group");
      group.querySelector(".field-error").textContent = message;
      group.classList.toggle("has-error", Boolean(message));
      return !message;
    };

    const validators = {
      username: () =>
        setError(
          username,
          username.value.trim().length < 3
            ? "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lsin."
            : ""
        ),
      email: () =>
        setError(
          email,
          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())
            ? ""
            : "Email manzili noto'g'ri. Masalan: example@gmail.com"
        ),
      password: () =>
        setError(
          password,
          password.value.length < 6
            ? "Parol kamida 6 ta belgidan iborat bo'lsin."
            : ""
        ),
    };

    // Yozayotganda tekshirish
    Object.entries(validators).forEach(([name, check]) => {
      form.elements[name].addEventListener("blur", check);
      form.elements[name].addEventListener("input", () => {
        if (form.elements[name].closest(".input-group").classList.contains("has-error")) check();
      });
    });

    // Parolni ko'rsatish / yashirish
    const passGroup = password.closest(".input-group");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "toggle-password";
    toggle.textContent = "Ko'rsatish";
    toggle.addEventListener("click", () => {
      const hidden = password.type === "password";
      password.type = hidden ? "text" : "password";
      toggle.textContent = hidden ? "Yashirish" : "Ko'rsatish";
    });
    passGroup.classList.add("has-toggle");
    passGroup.appendChild(toggle);

    // Parol kuchi
    const strength = document.createElement("div");
    strength.className = "password-strength";
    strength.innerHTML = '<span class="bar"></span><span class="label"></span>';
    passGroup.appendChild(strength);

    password.addEventListener("input", () => {
      const v = password.value;
      let score = 0;
      if (v.length >= 6) score++;
      if (v.length >= 10) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;

      const levels = ["", "Zaif", "O'rtacha", "Yaxshi", "Juda kuchli"];
      const bar = strength.querySelector(".bar");
      bar.dataset.level = v ? score || 1 : 0;
      strength.querySelector(".label").textContent = v ? levels[score || 1] : "";
    });

    // Yuborish
    const submitBtn = form.querySelector(".submit-btn");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = [validators.username(), validators.email(), validators.password()].every(Boolean);
      if (!ok) return;

      const name = username.value.trim();
      submitBtn.disabled = true;
      submitBtn.textContent = "Yuborilmoqda...";

      setTimeout(() => {
        const msg = document.createElement("p");
        msg.className = "form-success";
        msg.textContent = `Xush kelibsiz, ${name}! Ro'yxatdan o'tish muvaffaqiyatli yakunlandi.`;
        form.before(msg);
        form.reset();
        strength.querySelector(".bar").dataset.level = 0;
        strength.querySelector(".label").textContent = "";
        submitBtn.disabled = false;
        submitBtn.textContent = "Ro'yxatdan o'tish";
        setTimeout(() => msg.remove(), 5000);
      }, 700);
    });
  }

  /* 2. FAQ: bir vaqtda faqat bitta savol ochiq turadi */
  const faqToggles = document.querySelectorAll(".accordion-toggle");
  faqToggles.forEach((t) =>
    t.addEventListener("change", () => {
      if (t.checked) faqToggles.forEach((o) => o !== t && (o.checked = false));
    })
  );

  /* 3. Silliq scroll (header balandligini hisobga olgan holda) */
  const header = document.querySelector(".header");
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
    });
  });

  /* 4. Header soyasi, scroll-spy va tepaga qaytish tugmasi */
  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "back-to-top";
  topBtn.setAttribute("aria-label", "Tepaga qaytish");
  topBtn.textContent = "↑";
  topBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
  document.body.appendChild(topBtn);

  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const sections = navItems
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
    topBtn.classList.toggle("show", window.scrollY > 500);

    const pos = window.scrollY + (header ? header.offsetHeight : 0) + 80;
    let current = null;
    sections.forEach((s) => {
      if (s.offsetTop <= pos) current = s;
    });
    navItems.forEach((a) =>
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id)
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 5. Statistika raqamlari animatsiyasi */
  const animateCounter = (el) => {
    const text = el.textContent.trim();
    const target = parseInt(text.replace(/[^\d]/g, ""), 10);
    if (isNaN(target)) return;
    const suffix = text.replace(/[\d,]/g, "");
    const useComma = text.includes(",");
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * p);
      el.textContent = (useComma ? value.toLocaleString("en-US") : value) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* 6. Ko'ringanda paydo bo'lish effekti */
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll(".stat-card h3").forEach((el) => counterObserver.observe(el));

    const revealEls = document.querySelectorAll(
      ".feature-card, .uni-card, .check-item, .accordion-item"
    );
    revealEls.forEach((el) => el.classList.add("reveal"));
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }
});
