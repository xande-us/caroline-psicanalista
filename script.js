/* ==========================================================================
   CAROLINE COCONESI — PSICANALISTA
   Vanilla JS — leve, sem dependências
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano dinâmico no footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header com fundo ao rolar ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Fio condutor — marcador acompanha o progresso do scroll ---------- */
  const threadDot = document.getElementById('thread-dot');

  const updateThread = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    if (threadDot) {
      threadDot.style.top = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
    }
  };

  /* ---------- Parallax suave na imagem do Hero ---------- */
  const heroBg = document.getElementById('hero-parallax');
  const hero = document.getElementById('hero');
  const heroImg = heroBg ? heroBg.querySelector('img') : null;

  const updateParallax = () => {
    if (!heroImg || !hero) return;
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;
    if (scrollY < heroHeight) {
      const offset = scrollY * 0.18;
      heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateThread();
        if (!prefersReducedMotion) updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  };

  updateThread();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateThread);

  /* ---------- Animate on Scroll — Intersection Observer ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -80px 0px'
    });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Formulário de contato ----------
     PENDENTE: o formulário ainda NÃO envia e-mail de verdade. Falta o e-mail de
     destino da Caroline para configurar o backend (Formspree/EmailJS/rota
     serverless). Enquanto isso, apenas exibimos confirmação visual, sem persistir
     nem enviar os dados. Não conectar a nenhum destino sem o e-mail confirmado. */
  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const defaultNote = formNote ? formNote.textContent : '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const primeiroNome = nome ? nome.split(' ')[0] : '';

      if (formNote) {
        formNote.textContent = primeiroNome
          ? `Obrigada, ${primeiroNome}! Assim que o envio estiver ativo, sua mensagem chega direto para a Caroline.`
          : 'Assim que o envio estiver ativo, sua mensagem chega direto para a Caroline.';
        formNote.style.color = 'var(--terracotta)';
      }

      form.reset();

      // Restaura o microcopy padrão depois de alguns segundos
      if (formNote) {
        setTimeout(() => {
          formNote.textContent = defaultNote;
          formNote.style.color = '';
        }, 6000);
      }
    });
  }

});
