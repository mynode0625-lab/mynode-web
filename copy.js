// 메일 주소 복사 버튼. 외부로 아무것도 보내지 않는다.
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]');
  if (!b) return;
  try {
    await navigator.clipboard.writeText(b.dataset.copy);
  } catch {
    const t = document.createElement('textarea');
    t.value = b.dataset.copy; document.body.appendChild(t); t.select();
    document.execCommand('copy'); t.remove();
  }
  if (b.classList.contains('done')) return;
  const icon = b.innerHTML;
  b.innerHTML = CHECK;
  b.classList.add('done');
  setTimeout(() => { b.innerHTML = icon; b.classList.remove('done'); }, 1500);
});
