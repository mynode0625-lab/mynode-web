// 하루첫말 랜딩 움직임. 외부로 아무것도 보내지 않는다.
// <head>에서 불러온다: .js 표시를 먼저 달아 하단 고정 버튼 자리를 잡는다.
// 등장 효과는 준비가 끝난 뒤에만 켠다(.reveal-on) — 스크립트가 중간에 멈춰도 내용은 보인다.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // 상단 메뉴 아래 선
  const top = document.querySelector('.top');
  if (top) {
    const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 스크롤 등장
  if (hasIO && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    document.documentElement.classList.add('reveal-on');
  }

  setupPhone(reduce, hasIO);
  setupGallery(reduce);
  setupSticky(hasIO);
});

// 휴대폰 모형: 알람 → '확언 쓰기' 누름 → 한 줄 쓰기 → 저장
function setupPhone(reduce, hasIO) {
  const phone = document.querySelector('.phone');
  const typed = phone && phone.querySelector('.typed');
  if (!phone || !typed || reduce) return;

  const text = typed.dataset.text;
  const chars = Array.from(text);
  let gen = 0;          // 돌고 있는 루프 번호. 바뀌면 이전 루프는 그 자리에서 끝난다
  let timer = null;
  let wake = null;      // 기다리는 중인 루프를 깨우는 함수 (멈출 때 바로 끝내게)
  let inView = !hasIO;

  const rest = () => {
    typed.textContent = text;
    phone.classList.remove('typing', 'tap');
    phone.dataset.scene = 'write';
  };

  function stop() {
    gen++;
    clearTimeout(timer);
    if (wake) { const w = wake; wake = null; w(); }
    rest();
  }

  async function start() {
    stop();
    const my = gen;
    const wait = (ms) => new Promise((resolve) => {
      wake = resolve;
      timer = setTimeout(() => { wake = null; resolve(); }, ms);
    });
    const alive = () => my === gen;
    while (alive()) {
      typed.textContent = '';
      phone.classList.remove('typing', 'tap');
      phone.dataset.scene = 'alarm';
      await wait(2200); if (!alive()) return;
      phone.classList.add('tap');
      await wait(650); if (!alive()) return;
      phone.classList.remove('tap');
      phone.classList.add('typing');
      phone.dataset.scene = 'write';
      await wait(700); if (!alive()) return;
      for (let i = 1; i <= chars.length; i++) {
        typed.textContent = chars.slice(0, i).join('');
        await wait(chars[i - 1] === ' ' ? 60 : 95); if (!alive()) return;
      }
      phone.classList.remove('typing');
      await wait(1300); if (!alive()) return;
      phone.dataset.scene = 'done';
      await wait(3400);
    }
  }

  const sync = () => { if (inView && !document.hidden) start(); else stop(); };

  if (hasIO) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(phone);
  } else {
    sync();
  }
  document.addEventListener('visibilitychange', sync);
}

// 카드 갤러리 이전·다음 버튼
function setupGallery(reduce) {
  const track = document.querySelector('.cards');
  const nav = document.querySelector('.cards-nav');
  if (!track || !nav) return;
  const prev = nav.querySelector('[data-dir="-1"]');
  const next = nav.querySelector('[data-dir="1"]');
  const step = () => {
    const img = track.querySelector('img');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return img ? img.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-dir]');
    if (!b) return;
    track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  nav.hidden = false;
  update();
}

// 휴대폰 하단 고정 신청 버튼: 히어로를 지난 뒤, 다른 신청 버튼·푸터가 안 보일 때만
function setupSticky(hasIO) {
  const sticky = document.querySelector('.sticky-cta');
  const link = sticky && sticky.querySelector('a');
  const anchors = ['#hero-cta', '#final-cta', 'footer'].map((s) => document.querySelector(s)).filter(Boolean);
  if (!sticky || !link || !hasIO || anchors.length < 3) return;

  const seen = new Set();
  let passedHero = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
      if (e.target === anchors[0]) passedHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    });
    const show = passedHero && seen.size === 0;
    sticky.classList.toggle('show', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    link.tabIndex = show ? 0 : -1;
  });
  anchors.forEach((el) => io.observe(el));
}
