export function setupAdaptiveVideos({ prefersReducedMotion }) {
  const videos = Array.from(
    document.querySelectorAll(".pp-hero-bg, .pp-services-bg-video, .pp-team-bg-video")
  );

  if (!videos.length) {
    return;
  }

  const hydratedVideos = new Set();

  const primeVideo = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  };

  const hydrateVideo = (video) => {
    if (video.dataset.hydrated === "true") {
      return;
    }

    const src = video.dataset.videoSrc;
    if (!src) {
      return;
    }

    primeVideo(video);
    video.src = src;
    video.dataset.hydrated = "true";
    hydratedVideos.add(video);
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
    video.dataset.playing = "false";
    hydratedVideos.delete(video);
  };

  const playVideo = (video) => {
    primeVideo(video);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          video.dataset.playing = "true";
        })
        .catch(() => {
          video.dataset.playing = "false";
        });
      return;
    }

    video.dataset.playing = "true";
  };

  const isNearViewport = (video) => {
    const rect = video.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom >= -160 && rect.top <= viewportHeight + 240;
  };

  const hydrateAndPlay = (video) => {
    hydrateVideo(video);

    if (video.readyState >= 2) {
      playVideo(video);
      return;
    }

    video.addEventListener("loadeddata", () => playVideo(video), { once: true });
  };

  const retryPlayback = () => {
    hydratedVideos.forEach((video) => {
      if (video.dataset.playing !== "true") {
        playVideo(video);
      }
    });
  };

  let observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (!(video instanceof HTMLVideoElement)) {
            return;
          }

          if (entry.isIntersecting) {
            hydrateAndPlay(video);
          } else if (video.dataset.hydrated === "true") {
            video.pause();
            video.dataset.playing = "false";
          }
        });
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.01,
      }
    );
  }

  const syncVideos = () => {
    const shouldPause = prefersReducedMotion.matches;

    videos.forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) {
        return;
      }

      if (shouldPause) {
        dehydrateVideo(video);
        return;
      }

      hydrateVideo(video);

      if (observer) {
        observer.observe(video);

        if (video.classList.contains("pp-hero-bg") || isNearViewport(video)) {
          hydrateAndPlay(video);
        }

        return;
      }

      hydrateAndPlay(video);
    });
  };

  syncVideos();
  prefersReducedMotion.addEventListener("change", syncVideos);
  window.addEventListener("pageshow", retryPlayback);
  window.addEventListener("scroll", retryPlayback, { passive: true });
  document.addEventListener("pointerdown", retryPlayback, { passive: true });
  document.addEventListener("touchstart", retryPlayback, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !prefersReducedMotion.matches) {
      retryPlayback();
    }
  });
}
