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
    // No celular a foto fica abaixo do texto: o deslocamento abriria um vão no
    // topo da máscara (e é trabalho de scroll desnecessário em aparelho fraco)
    if (window.innerWidth < 900) {
      heroImg.style.transform = '';
      return;
    }
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
     Envio via Web3Forms (https://web3forms.com). A chave abaixo está vinculada ao
     e-mail da Caroline: é pública por design (só permite ENVIAR para ela), então
     pode ficar no código. Para trocar o e-mail de destino, gere uma nova chave. */
  const WEB3FORMS_KEY = '22863098-82d8-4aa5-ab1b-23ccdce547d7';

  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const defaultNote = formNote ? formNote.textContent : '';
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const defaultBtn = submitBtn ? submitBtn.textContent : '';

  const setNote = (text, color) => {
    if (!formNote) return;
    formNote.textContent = text;
    formNote.style.color = color || '';
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const mensagem = form.mensagem.value.trim();

      if (!nome || !email || !mensagem) {
        setNote('Preencha nome, e-mail e mensagem para enviar.', 'var(--terracotta)');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setNote('Confira o e-mail informado — ele é o caminho para a resposta.', 'var(--terracotta)');
        form.email.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
      setNote('');

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Nova mensagem pelo site — ${nome}`,
            from_name: 'Site Caroline Coconesi',
            name: nome,
            email,               // vira o "responder para": a Caroline responde direto ao paciente
            message: mensagem,
            botcheck: form.botcheck.checked
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || res.status);

        const primeiroNome = nome.split(' ')[0];
        form.reset();
        setNote(`Obrigada, ${primeiroNome}! Sua mensagem foi enviada. Responderei pessoalmente em até 24 horas úteis.`, 'var(--terracotta)');
        setTimeout(() => setNote(defaultNote), 10000);
      } catch (err) {
        setNote('Não foi possível enviar agora. Tente novamente em instantes ou chame no WhatsApp.', 'var(--terracotta)');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtn;
      }
    });
  }

});
