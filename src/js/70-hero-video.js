// Video hero: tự phát khi đang nhìn thấy, tạm dừng khi cuộn khỏi màn hình.
// Người dùng bật "giảm chuyển động" thì chỉ thấy ảnh poster.
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  let heroInView = true;

  const syncHeroVideo = () => {
    if (reducedMotion.matches || !heroInView) heroVideo.pause();
    else heroVideo.play().catch(() => {}); // trình duyệt chặn tự phát thì giữ poster
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      syncHeroVideo();
    }).observe(heroVideo);
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', syncHeroVideo);
  syncHeroVideo();

  // Nút bật/tắt tiếng. Bấm là thao tác của người dùng nên trình duyệt cho phép phát có tiếng.
  const soundBtn = document.getElementById('hero-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      const on = !heroVideo.muted;
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.setAttribute('aria-label', on ? 'Tắt tiếng video' : 'Bật tiếng video');
      if (on) heroVideo.play().catch(() => {}); // người dùng chủ động nghe thì phát luôn, kể cả khi bật "giảm chuyển động"
    });
  }
}
