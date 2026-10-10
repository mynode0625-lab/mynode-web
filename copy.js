// 메일 주소 복사 버튼. 외부로 아무것도 보내지 않는다.
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]');
  if (!b) return;
  const text = b.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand('copy'); t.remove();
  }
  const label = b.textContent;
  b.textContent = '복사했어요 ✓';
  b.classList.add('done');
  setTimeout(() => { b.textContent = label; b.classList.remove('done'); }, 1600);
});
