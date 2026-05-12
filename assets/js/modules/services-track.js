export function setupServicesTrack({ prefersReducedMotion } = {}) {
  const track = document.getElementById("servicesTrack");
  if (!track || !track.parentElement) {
    return;
  }

  const viewport = track.parentElement;

  if (track.dataset.marqueeReady === "true") {
    return;
  }

  const originalCards = Array.from(track.children);
  if (!originalCards.length) {
    return;
  }

  track.dataset.marqueeReady = "true";

  const reducedMotionQuery =
    prefersReducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  let loopWidth = 0;
  let isAdjustingScroll = false;
  let isManualMode = false;
  let isDragging = false;
  let lastPointerX = 0;
  let draggedDistance = 0;
  let suppressClick = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchTracking = false;
  const dragClickThreshold = 6;

  const cloneFragment = document.createDocumentFragment();
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button, input, textarea, select").forEach((node) => {
      node.setAttribute("tabindex", "-1");
    });
    cloneFragment.appendChild(clone);
  });

  track.appendChild(cloneFragment);
  track.style.transform = "";
  track.classList.add("pp-services-track--marquee");

  const updateLoopWidth = () => {
    const startA = track.children[0];
    const startB = track.children[originalCards.length];

    if (!startA || !startB) {
      loopWidth = 0;
      return;
    }

    const rectA = startA.getBoundingClientRect();
    const rectB = startB.getBoundingClientRect();
    loopWidth = Math.max(0, rectB.left - rectA.left);
  };

  const wrapViewportScroll = () => {
    if (!isManualMode || !loopWidth || isAdjustingScroll) {
      return;
    }

    let targetScrollLeft = null;

    if (viewport.scrollLeft <= 1) {
      targetScrollLeft = viewport.scrollLeft + loopWidth;
    }

    if (viewport.scrollLeft >= loopWidth) {
      targetScrollLeft = viewport.scrollLeft - loopWidth;
    }

    if (targetScrollLeft !== null) {
      isAdjustingScroll = true;
      viewport.scrollLeft = targetScrollLeft;
      isAdjustingScroll = false;
    }
  };

  const applyReducedMotionState = () => {
    track.classList.toggle("pp-services-track--paused", reducedMotionQuery.matches);
  };

  applyReducedMotionState();
  reducedMotionQuery.addEventListener?.("change", applyReducedMotionState);
  updateLoopWidth();
  viewport.scrollLeft = 0;

  const setUserPaused = (paused) => {
    track.classList.toggle("pp-services-track--user-paused", paused);
  };

  const setManualMode = (enabled) => {
    isManualMode = enabled;
    track.classList.toggle("pp-services-track--manual", enabled);

    if (!enabled) {
      viewport.scrollLeft = 0;
      return;
    }

    if (loopWidth) {
      viewport.scrollLeft = Math.max(1, loopWidth * 0.5);
    }
  };

  const startDrag = (clientX) => {
    setManualMode(true);
    isDragging = true;
    lastPointerX = clientX;
    draggedDistance = 0;
    viewport.classList.add("pp-services-viewport--dragging");
    document.body.style.userSelect = "none";
    setUserPaused(true);
  };

  const moveDrag = (clientX, event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = clientX - lastPointerX;
    lastPointerX = clientX;
    draggedDistance += Math.abs(deltaX);
    viewport.scrollLeft -= deltaX;
    wrapViewportScroll();
    event.preventDefault();
  };

  const endDrag = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    viewport.classList.remove("pp-services-viewport--dragging");
    document.body.style.userSelect = "";

    if (!isManualMode && !reducedMotionQuery.matches) {
      setUserPaused(false);
    }

    if (draggedDistance > dragClickThreshold) {
      suppressClick = true;
    }
  };

  viewport.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }

    startDrag(event.clientX);
  });

  window.addEventListener("mousemove", (event) => {
    moveDrag(event.clientX, event);
  });

  window.addEventListener("mouseup", endDrag);

  viewport.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      isTouchTracking = true;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      if (!isDragging && isTouchTracking) {
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX < dragClickThreshold && absY < dragClickThreshold) {
          return;
        }

        if (absX <= absY) {
          isTouchTracking = false;
          return;
        }

        startDrag(touch.clientX);
      }

      if (!isDragging) {
        return;
      }

      isTouchTracking = false;

      moveDrag(touch.clientX, event);
    },
    { passive: false }
  );

  window.addEventListener("touchend", () => {
    isTouchTracking = false;
    endDrag();
  });

  window.addEventListener("touchcancel", () => {
    isTouchTracking = false;
    endDrag();
  });

  viewport.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) {
        return;
      }

      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  viewport.addEventListener(
    "wheel",
    (event) => {
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);

      if (!absX || absX <= absY) {
        return;
      }

      viewport.scrollLeft += event.deltaX;
      wrapViewportScroll();
      event.preventDefault();
    },
    { passive: false }
  );

  viewport.addEventListener(
    "scroll",
    () => {
      wrapViewportScroll();
    },
    { passive: true }
  );

  viewport.addEventListener("mouseenter", () => {
    setManualMode(true);
    setUserPaused(true);
  });

  viewport.addEventListener("mouseleave", () => {
    if (isDragging) {
      return;
    }

    setManualMode(false);
    if (!reducedMotionQuery.matches) {
      setUserPaused(false);
    }
  });

  window.addEventListener("resize", () => {
    updateLoopWidth();
    wrapViewportScroll();
  });
}
