/** HEXAWATER — interactive layer (zero dependencies; no user data collection). */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const config = window.HEXAWATER_CONFIG || {};
  let animationPaused = reduceMotion.matches;
  const motionToggle = $('#motionToggle');
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const backTop = $('#backTop');
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const toast = $('#toast');
  let toastTimeout = 0;
  let scrollScheduled = false;


  // ── Entrance and soundtrack ────────────────────────────────────────────
  // Browsers only start the uploaded song after a *real click*. Silent entry
  // avoids starting a media request. No third-party players or analytics.
  const intro = $('#entryScreen');
  const enterWithMusic = $('#enterWithMusic');
  const enterQuiet = $('#enterQuiet');
  const audio = $('#siteAudio');
  const player = $('#musicPlayer');
  const toggle = $('#musicToggle');
  const mute = $('#musicMute');
  const volume = $('#musicVolume');
  const volumeText = $('#musicVolumeText');
  const musicState = $('#musicState');
  let didEnter = false;
  let fadeFrame = 0;
  const audioStorageKey = 'hexawater.sound.volume.v2';

  function getSavedVolume() {
    try {
      const raw = localStorage.getItem(audioStorageKey);
      if (raw === null) return 22;
      const value = Number(raw);
      return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 22;
    } catch { return 22; }
  }
  let chosenVolume = getSavedVolume();
  audio.volume = chosenVolume / 100;
  volume.value = String(chosenVolume);

  function saveVolume() {
    try { localStorage.setItem(audioStorageKey, String(chosenVolume)); } catch { /* optional */ }
  }

  function setPlayerUI() {
    const playing = !audio.paused;
    const audible = playing && !audio.muted && chosenVolume > 0;
    const playerIcon = $('use', toggle);
    const muteIcon = $('use', mute);
    if (playerIcon) playerIcon.setAttribute('href', playing ? '#i-pause' : '#i-play');
    if (muteIcon) muteIcon.setAttribute('href', audio.muted || chosenVolume === 0 ? '#i-volume-x' : '#i-volume');
    toggle?.setAttribute('aria-label', playing ? '배경음악 일시정지' : '배경음악 재생');
    mute?.setAttribute('aria-label', audio.muted ? '음소거 해제' : '음소거');
    mute?.setAttribute('aria-pressed', String(audio.muted));
    if (musicState) musicState.textContent = audible ? '재생 중' : playing ? '음소거 중' : '일시정지';
    if (volumeText) volumeText.textContent = `${chosenVolume}%`;
    if (volume) volume.style.setProperty('--volume-fill', `${chosenVolume}%`);
    player?.classList.toggle('is-playing', audible);
  }

  function cancelFade() {
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = 0;
  }
  function fadeTo(target, duration, done) {
    cancelFade();
    const from = audio.volume;
    if (reduceMotion.matches || duration <= 0) {
      audio.volume = target;
      done?.();
      return;
    }
    const initial = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - initial) / duration);
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * (1 - (1-t)**3)));
      if (t < 1) fadeFrame = requestAnimationFrame(tick);
      else { fadeFrame = 0; done?.(); }
    }
    fadeFrame = requestAnimationFrame(tick);
  }
  function startMusic() {
    if (!audio.paused) {
      if (audio.muted) audio.muted = false;
      fadeTo(chosenVolume / 100, 240);
      setPlayerUI();
      return;
    }
    cancelFade();
    audio.muted = false;
    audio.volume = 0;
    // play() must execute synchronously inside the user's click handler.
    const result = audio.play();
    if (result && typeof result.then === 'function') {
      result.then(() => {
        fadeTo(chosenVolume / 100, 1050);
        setPlayerUI();
      }).catch(() => {
        cancelFade();
        audio.pause();
        audio.volume = chosenVolume / 100;
        setPlayerUI();
        showToast('음악을 재생할 수 없어요. 브라우저 설정 또는 음원 파일을 확인해주세요.');
      });
    } else {
      fadeTo(chosenVolume / 100, 1050);
    }
  }
  function pauseMusic() {
    cancelFade();
    if (audio.paused) return;
    fadeTo(0, 300, () => {
      audio.pause();
      audio.volume = chosenVolume / 100;
      setPlayerUI();
    });
  }

  const introBackground = [header, $('#main'), $('.footer'), $('#backTop'), $('.skip-link'), $('#toast'), $('#joinDialog')];
  function setBackgroundInert(inert) {
    introBackground.forEach(element => { if (element) element.inert = inert; });
  }
  if (intro) {
    setBackgroundInert(true);
    // Only intro controls are reachable by keyboard while the entry gate is up.
    requestAnimationFrame(() => { if (!didEnter) enterWithMusic?.focus({preventScroll:true}); });
    intro.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); enterSite(false); return; }
      if (event.key !== 'Tab') return;
      const buttons = [enterWithMusic, enterQuiet];
      const at = buttons.indexOf(document.activeElement);
      if (event.shiftKey && at === 0) { event.preventDefault(); enterQuiet?.focus(); }
      else if (!event.shiftKey && at === buttons.length - 1) { event.preventDefault(); enterWithMusic?.focus(); }
    });
  } else { html.classList.remove('entry-pending'); }

  function enterSite(withMusic) {
    if (didEnter) return;
    didEnter = true;
    if (withMusic) startMusic();
    if (player) player.hidden = false;
    setPlayerUI();
    intro?.classList.add('is-exiting');
    const complete = () => {
      html.classList.remove('entry-pending');
      setBackgroundInert(false);
      if (intro) intro.hidden = true;
      $('#main')?.focus({preventScroll:true});
    };
    if (reduceMotion.matches) complete();
    else window.setTimeout(complete, 620);
  }
  enterWithMusic?.addEventListener('click', () => enterSite(true));
  enterQuiet?.addEventListener('click', () => enterSite(false));

  toggle?.addEventListener('click', () => {
    if (audio.paused) startMusic();
    else pauseMusic();
  });
  mute?.addEventListener('click', () => {
    audio.muted = !audio.muted;
    setPlayerUI();
  });
  volume?.addEventListener('input', () => {
    chosenVolume = Math.min(100, Math.max(0, Number(volume.value) || 0));
    saveVolume();
    cancelFade();
    if (chosenVolume > 0 && audio.muted) audio.muted = false;
    audio.volume = chosenVolume / 100;
    setPlayerUI();
  });
  audio?.addEventListener('play', setPlayerUI);
  audio?.addEventListener('pause', setPlayerUI);
  audio?.addEventListener('volumechange', () => {
    // The displayed volume is the intended user level, not the fade-in level.
    player?.classList.toggle('is-playing', !audio.paused && !audio.muted && chosenVolume > 0);
  });
  audio?.addEventListener('error', () => {
    cancelFade();
    setPlayerUI();
    showToast('음원 파일을 열지 못했어요. assets/rebel-heart.mp3를 확인해주세요.');
  });
  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'REBEL HEART', artist:'IVE', album:'육각수 · HEXAWATER',
        artwork:[{src:'assets/icon-512.png',sizes:'512x512',type:'image/png'}]
      });
      navigator.mediaSession.setActionHandler('play', () => startMusic());
      navigator.mediaSession.setActionHandler('pause', () => pauseMusic());
    } catch { /* Optional browser media session integration. */ }
  }
  setPlayerUI();

  if (reduceMotion.matches) html.classList.add('still');
  if (motionToggle) {
    motionToggle.setAttribute('aria-pressed', String(animationPaused));
    motionToggle.setAttribute('aria-label', animationPaused ? '배경 움직임 켜기' : '배경 움직임 줄이기');
    motionToggle.addEventListener('click', () => {
      animationPaused = !animationPaused;
      html.classList.toggle('still', animationPaused);
      motionToggle.setAttribute('aria-pressed', String(animationPaused));
      motionToggle.setAttribute('aria-label', animationPaused ? '배경 움직임 켜기' : '배경 움직임 줄이기');
    });
  }

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max))})`;
    header?.classList.toggle('scrolled', y > 26);
    backTop?.classList.toggle('is-visible', y > 690);
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: animationPaused ? 'instant' : 'smooth' }));

  // Accessible mobile menu. Close on navigation, Escape, or moving to desktop.
  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    $('use', menuToggle)?.setAttribute('href', open ? '#i-close' : '#i-menu');
    document.body.classList.toggle('menu-is-open', open);
  }
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileMenu || document.createElement('nav')).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu?.classList.contains('is-open')) { setMenu(false); menuToggle?.focus(); }
  });
  window.matchMedia('(min-width: 1021px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // IntersectionObserver reveals with graceful no-observer fallback.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -42px 0px', threshold: 0.08 });
    reveals.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min((index % 4) * 60, 180)}ms`;
      revealObserver.observe(element);
    });
  } else {
    reveals.forEach(element => element.classList.add('is-visible'));
  }

  // Section-aware navigation state.
  if ('IntersectionObserver' in window) {
    const links = $$('[data-nav]');
    const ids = new Set(links.map(link => link.dataset.nav));
    const sections = $$('section[id]').filter(section => ids.has(section.id));
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      links.forEach(link => link.classList.toggle('is-active', link.dataset.nav === visible[0].target.id));
    }, { rootMargin: '-21% 0px -54% 0px', threshold: [0, .1, .2, .4, .6] });
    sections.forEach(section => navObserver.observe(section));
  }

  // Seoul-time countdown (independent of the visitor's own timezone).
  const offset = 9 * 60 * 60 * 1000;
  const pad = n => String(n).padStart(2, '0');
  function updateCountdown() {
    const now = Date.now();
    const kst = new Date(now + offset);
    let target = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate(), 22 - 9, 0, 0);
    if (target <= now) target += 24 * 60 * 60 * 1000;
    let diff = Math.max(0, Math.ceil((target - now) / 1000));
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hours = Math.floor(diff / 3600); diff %= 3600;
    const minutes = Math.floor(diff / 60); const seconds = diff % 60;
    [['#countDays',days],['#countHours',hours],['#countMins',minutes],['#countSecs',seconds]].forEach(([id,num]) => {
      const element = $(id);
      if (element) element.textContent = pad(num);
    });
    const clock = $('#kstClock');
    if (clock) {
      clock.textContent = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).format(now) + ' KST';
    }
  }
  updateCountdown();
  window.setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });
  const footerYear = $('#footerYear');
  if (footerYear) footerYear.textContent = new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Seoul', year:'numeric' }).format(new Date());

  // Expand or collapse all guild rules (native <details> remains keyboard accessible).
  const expandRules = $('#expandRules');
  const ruleDetails = $$('.rule-detail');
  function syncRuleButton() {
    const allOpen = ruleDetails.every(details => details.open);
    expandRules?.setAttribute('aria-pressed', String(allOpen));
    if (expandRules) expandRules.innerHTML = `<svg class="icon"><use href="#i-plus"/></svg>${allOpen ? '모든 규칙 접기' : '모든 규칙 펼치기'}`;
  }
  expandRules?.addEventListener('click', () => {
    const shouldOpen = !ruleDetails.every(details => details.open);
    ruleDetails.forEach(details => { details.open = shouldOpen; });
    syncRuleButton();
  });
  ruleDetails.forEach(details => details.addEventListener('toggle', syncRuleButton));
  syncRuleButton();

  // Recruitment URLs are intentionally configured separately; never guess private invite links.
  const dialog = $('#joinDialog');
  const allowedRecruitmentUrl = (() => {
    try {
      if (!config.recruitmentUrl || typeof config.recruitmentUrl !== 'string') return '';
      const url = new URL(config.recruitmentUrl);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  })();
  if (typeof config.recruitmentLabel === 'string' && config.recruitmentLabel.trim()) {
    const headerLabel = $('[data-recruitment] span');
    if (headerLabel) headerLabel.textContent = config.recruitmentLabel.trim();
  }
  $$('[data-recruitment]').forEach(button => button.addEventListener('click', () => {
    setMenu(false);
    if (allowedRecruitmentUrl) {
      window.open(allowedRecruitmentUrl, '_blank', 'noopener,noreferrer');
    } else if (dialog?.showModal) {
      dialog.showModal();
    } else {
      showToast('현재 공개 가입 문의 링크가 등록되지 않았습니다.');
    }
  }));
  $('#dialogClose')?.addEventListener('click', () => dialog?.close());
  $('#dialogOkay')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }
  // Share button prefers the native share sheet; falls back to safe clipboard copy.
  $('#sharePage')?.addEventListener('click', async () => {
    const data = { title:'육각수 · HEXAWATER', text:'함께할수록 선명해지는 우리, 육각수 길드', url:window.location.href };
    if (navigator.share && /^https?:/.test(location.protocol)) {
      try { await navigator.share(data); return; } catch (error) { if (error?.name === 'AbortError') return; }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(location.href);
      showToast('페이지 주소가 복사되었어요.');
    } catch {
      try {
        const input = document.createElement('textarea');
        input.value = location.href; input.setAttribute('readonly','');
        input.style.position = 'fixed'; input.style.left = '-10000px';
        document.body.appendChild(input); input.select();
        const copied = document.execCommand('copy'); input.remove();
        showToast(copied ? '페이지 주소가 복사되었어요.' : '브라우저 주소창에서 주소를 복사해 주세요.');
      } catch { showToast('브라우저 주소창에서 주소를 복사해 주세요.'); }
    }
  });

  // Hover light responds to a fine pointer. All cards remain fully usable without it.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion.matches) {
    const cursor = $('#cursorLight');
    let pointerX = -1000, pointerY = -1000, currentX = -1000, currentY = -1000;
    document.addEventListener('pointermove', event => {
      pointerX = event.clientX - 220;
      pointerY = event.clientY - 220;
    }, { passive: true });
    function animateLight() {
      if (!animationPaused) {
        currentX += (pointerX - currentX) * .11;
        currentY += (pointerY - currentY) * .11;
        if (cursor) cursor.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      }
      requestAnimationFrame(animateLight);
    }
    requestAnimationFrame(animateLight);
    $$('[data-tilt]').forEach(card => card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${Math.round((event.clientX - rect.left) / rect.width * 100)}%`);
      card.style.setProperty('--my', `${Math.round((event.clientY - rect.top) / rect.height * 100)}%`);
    }, { passive: true }));
  }

  // Lightweight hexagonal constellation canvas — capped DPR and 30 FPS, offscreen paused.
  const canvas = $('#heroParticles');
  const hero = $('.hero');
  if (canvas && hero && 'IntersectionObserver' in window && !reduceMotion.matches) {
    const ctx = canvas.getContext('2d', { alpha:true });
    if (ctx) {
      let particles = [], width = 0, height = 0, heroVisible = true, lastFrame = 0;
      const resize = () => {
        const rect = hero.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
        const count = Math.min(50, Math.max(24, Math.floor(width / 26)));
        particles = Array.from({ length:count }, () => ({
          x:Math.random()*width, y:Math.random()*height,
          size:2+Math.random()*5, speed:.07+Math.random()*.17,
          phase:Math.random()*Math.PI*2, alpha:.05+Math.random()*.16
        }));
      };
      resize();
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
      else window.addEventListener('resize', resize, { passive:true });
      new IntersectionObserver(entries => {
        heroVisible = entries[0]?.isIntersecting || false;
      }, { rootMargin:'100px' }).observe(hero);
      function frame(time) {
        requestAnimationFrame(frame);
        if (!heroVisible || document.hidden || animationPaused || time - lastFrame < 33) return;
        lastFrame = time;
        ctx.clearRect(0,0,width,height);
        ctx.lineWidth = .9;
        for (const p of particles) {
          p.y -= p.speed;
          p.x += Math.sin(time*.00024+p.phase)*.12;
          if (p.y < -14) { p.y=height+14; p.x=Math.random()*width; }
          const a = p.alpha * (.78+.22*Math.sin(time*.001+p.phase));
          ctx.strokeStyle = `rgba(154,255,233,${Math.max(.03,a)})`;
          ctx.beginPath();
          for(let i=0;i<=6;i++) {
            const angle=(Math.PI/3)*i-Math.PI/6;
            const x=p.x+Math.cos(angle)*p.size;
            const y=p.y+Math.sin(angle)*p.size;
            if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          }
          ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }
  }

  // Installable offline app shell; GitHub project pages and root pages both supported.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      const register = () => navigator.serviceWorker.register('./sw.js').catch(() => {});
      if ('requestIdleCallback' in window) requestIdleCallback(register, { timeout: 4500 });
      else setTimeout(register, 1500);
    });
  }
})();
