// Video hero: tự phát khi đang nhìn thấy, tạm dừng khi cuộn khỏi màn hình.
// Người dùng bật "giảm chuyển động" thì chỉ thấy ảnh poster.
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  // Poster mặc định là khổ dọc (điện thoại); máy tính dùng poster khổ 4:5.
  if (heroVideo.dataset.posterLg && window.matchMedia('(min-width: 860px)').matches) {
    heroVideo.poster = heroVideo.dataset.posterLg;
  }
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
}
