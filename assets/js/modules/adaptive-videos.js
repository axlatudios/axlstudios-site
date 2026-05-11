export function setupAdaptiveVideos({ prefersReducedMotion, isMobileViewport }) {
  const videos = document.querySelectorAll(
    ".pp-hero-bg, .pp-services-bg-video, .pp-team-bg-video"
  );

  if (!videos.length) {
    return;
  }

  const hydrateVideo = (video) => {
    if (video.dataset.hydrated === "true") {
      return;
    }

    const src = video.dataset.videoSrc;
    if (!src) {
      return;
    }

    video.src = src;
    video.dataset.hydrated = "true";
    video.load();
  };

  const dehydrateVideo = (video) => {
    if (video.dataset.hydrated !== "true") {
      return;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.dataset.hydrated = "false";
  };

  const syncVideos = () => {
    const shouldPause = prefersReducedMotion.matches || isMobileViewport.matches;

    videos.forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) {
        return;
      }

      if (shouldPause) {
        dehydrateVideo(video);
        return;
      }

      hydrateVideo(video);
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    });
  };

  syncVideos();
  prefersReducedMotion.addEventListener("change", syncVideos);
  isMobileViewport.addEventListener("change", syncVideos);
}
