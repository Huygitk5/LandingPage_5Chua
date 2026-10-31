// Video hero: tự phát khi đang nhìn thấy, tạm dừng khi cuộn khỏi màn hình.
// Người dùng bật "giảm chuyển động" thì chỉ thấy ảnh poster.
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroInView = true;

  const syncHeroVideo = () => {
    if (reduceMotion.matches || !heroInView) heroVideo.pause();
    else heroVideo.play().catch(() => {}); // trình duyệt chặn tự phát thì giữ poster
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      syncHeroVideo();
    }).observe(heroVideo);
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncHeroVideo);
  syncHeroVideo();
}
