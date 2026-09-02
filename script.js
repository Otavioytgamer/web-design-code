/* ============================================================================
   WEB DESIGN CODE — script principal
   ============================================================================
   [EDITAR] Altere o número de WhatsApp abaixo (apenas dígitos, com código
   do país 55 + DDD + número). Exemplo para (11) 91234-5678: "5511912345678"
   ============================================================================ */
const WHATSAPP_NUMBER = "5517992220475"; // [EDITAR] coloque aqui o número real

document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupLogoFallback();
  setupHeaderScroll();
  setupMobileMenu();
  setupWhatsappLinks();
  setupScrollSpy();
  setupRevealAnimations();
  setupQuoteForm();
  setupPortfolioModal();
});

/**
 * Monta uma URL do WhatsApp (wa.me) com mensagem pré-preenchida.
 */
function buildWhatsappLink(message) {
  const text = encodeURIComponent(message || "Olá! Gostaria de solicitar um orçamento.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Mantém o ano do rodapé sempre atualizado.
 */
function setupYear() {
  const yearEl = document.querySelector(".footer__copyright");
  if (!yearEl) return;
  const currentYear = new Date().getFullYear();
  yearEl.textContent = yearEl.textContent.replace(/\d{4}/, String(currentYear));
}

/**
 * Caso assets/img/logo.png ainda não exista, mostra o texto substituto
 * "<WDC>" no lugar da imagem, sem quebrar o layout do cabeçalho/rodapé.
 */
function setupLogoFallback() {
  document.querySelectorAll(".js-logo-img").forEach((img) => {
    img.addEventListener("error", () => {
      img.closest(".logo__badge")?.classList.add("logo__badge--missing");
    });
    if (img.complete && img.naturalWidth === 0) {
      img.closest(".logo__badge")?.classList.add("logo__badge--missing");
    }
  });
}

/**
 * Alterna o fundo do cabeçalho quando a página é rolada.
 */
function setupHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  const toggle = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/**
 * Menu hambúrguer para telas pequenas: abre/fecha, fecha ao clicar em um
 * link, ao clicar fora ou ao pressionar Escape.
 */
function setupMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  if (!hamburger || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Abrir menu de navegação");
  };

  const openMenu = () => {
    nav.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Fechar menu de navegação");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = nav.contains(event.target) || hamburger.contains(event.target);
    if (!clickedInsideNav && nav.classList.contains("is-open")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      hamburger.focus();
    }
  });
}

/**
 * Preenche automaticamente todos os links com a classe "whatsapp-link"
 * usando o texto definido em data-wa-message.
 */
function setupWhatsappLinks() {
  document.querySelectorAll(".whatsapp-link").forEach((link) => {
    link.href = buildWhatsappLink(link.dataset.waMessage);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

/**
 * Destaca o item do menu correspondente à seção visível na tela.
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav__link");
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Anima a entrada de elementos com a classe "reveal" conforme aparecem
 * na tela. Respeita a preferência de "reduzir movimento" do sistema.
 */
function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("in-view"), (index % 3) * 90);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/**
 * Validação e envio do formulário de orçamento: valida os campos
 * obrigatórios e, se tudo estiver correto, abre o WhatsApp com os
 * dados preenchidos pelo visitante.
 */
function setupQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const fields = {
    name: form.querySelector("#qfName"),
    phone: form.querySelector("#qfPhone"),
    siteType: form.querySelector("#qfType"),
    message: form.querySelector("#qfMessage"),
  };

  const setError = (field, hasError) => {
    const group = field.closest(".form-group");
    if (!group) return;
    group.classList.toggle("has-error", hasError);
    field.setAttribute("aria-invalid", hasError ? "true" : "false");
  };

  const isPhoneValid = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameValid = fields.name.value.trim().length >= 2;
    const phoneValid = isPhoneValid(fields.phone.value);
    const typeValid = fields.siteType.value !== "";

    setError(fields.name, !nameValid);
    setError(fields.phone, !phoneValid);
    setError(fields.siteType, !typeValid);

    if (!nameValid || !phoneValid || !typeValid) {
      status.textContent = "Por favor, preencha corretamente os campos destacados.";
      status.className = "form-status is-error";
      const firstInvalid = [fields.name, fields.phone, fields.siteType].find(
        (field) => field.closest(".form-group").classList.contains("has-error")
      );
      firstInvalid?.focus();
      return;
    }

    const messageLines = [
      "Olá! Gostaria de solicitar um orçamento pelo site da Web Design Code.",
      `Nome: ${fields.name.value.trim()}`,
      `Telefone: ${fields.phone.value.trim()}`,
      `Tipo de site: ${fields.siteType.value}`,
    ];
    if (fields.message.value.trim()) {
      messageLines.push(`Mensagem: ${fields.message.value.trim()}`);
    }

    window.open(buildWhatsappLink(messageLines.join("\n")), "_blank", "noopener,noreferrer");

    status.textContent = "Tudo certo! Abrimos o WhatsApp com os seus dados preenchidos.";
    status.className = "form-status is-success";
    form.reset();
    Object.values(fields).forEach((field) => setError(field, false));
  });

  // Remove o aviso de erro assim que o visitante corrige o campo.
  [fields.name, fields.phone, fields.siteType].forEach((field) => {
    field.addEventListener("input", () => setError(field, false));
  });
}

/**
 * Botão "Ver modelo" dos cards do portfólio: se o card tiver um link real
 * (data-portfolio-link diferente de "#"), abre esse link em nova aba; caso
 * contrário, abre uma visualização ampliada do mockup dentro de um modal.
 */
function setupPortfolioModal() {
  const modal = document.getElementById("portfolioModal");
  const buttons = document.querySelectorAll(".portfolio-card__btn");
  if (!modal || !buttons.length) return;

  const media = modal.querySelector(".portfolio-modal__media");
  const tagEl = modal.querySelector(".portfolio-modal__tag");
  const categoryEl = modal.querySelector(".portfolio-modal__category");
  const titleEl = modal.querySelector(".portfolio-modal__title");
  const descEl = modal.querySelector(".portfolio-modal__desc");
  let lastFocused = null;

  const openModal = (card) => {
    const screen = card.querySelector(".portfolio-card__screen");
    media.replaceChildren(screen ? screen.cloneNode(true) : "");
    tagEl.textContent = card.querySelector(".portfolio-card__tag")?.textContent || "Projeto demonstrativo";
    categoryEl.textContent = card.querySelector(".portfolio-card__category")?.textContent || "";
    titleEl.textContent = card.querySelector("h3")?.textContent || "";
    descEl.textContent = card.querySelector(".portfolio-card__body p")?.textContent || "";

    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    modal.querySelector(".portfolio-modal__close").focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lastFocused?.focus();
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const link = (btn.dataset.portfolioLink || "").trim();
      if (link && link !== "#") {
        window.open(link, "_blank", "noopener,noreferrer");
        return;
      }
      openModal(btn.closest(".portfolio-card"));
    });
  });

  modal.querySelectorAll("[data-portfolio-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}
