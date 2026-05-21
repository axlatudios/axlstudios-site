export function setupServicesTrack({ prefersReducedMotion } = {}) {
  const track = document.getElementById("servicesTrack");
  if (!track || !track.parentElement) return;

  const viewport = track.parentElement;
  if (track.dataset.marqueeReady === "true") return;

  const originalCards = Array.from(track.children);
  if (!originalCards.length) return;

  track.dataset.marqueeReady = "true";

  const reducedMotionQuery =
    prefersReducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)");

  const SCROLL_DURATION_MS = 46000;

  let loopWidth = 0;
  let position = 0;
  let rafId = null;
  let lastTimestamp = null;
  let isHovered = false;
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
  track.classList.add("pp-services-track--marquee");

  const updateLoopWidth = () => {
    loopWidth = track.scrollWidth / 2;
  };

  // Wraps scrollLeft in range [0, loopWidth) — chiamato solo quando loopWidth > 0
  const wrapScroll = () => {
    if (viewport.scrollLeft >= loopWidth) {
      viewport.scrollLeft -= loopWidth;
    }
  };

  // rAF tick: accumulates position as a float to avoid integer-rounding drift
  const autoScrollTick = (timestamp) => {
    if (lastTimestamp !== null && loopWidth > 0) {
      position += (loopWidth / SCROLL_DURATION_MS) * (timestamp - lastTimestamp);
      if (position >= loopWidth) position -= loopWidth;
      viewport.scrollLeft = position;
    }
    lastTimestamp = timestamp;
    rafId = requestAnimationFrame(autoScrollTick);
  };

  const startAutoScroll = () => {
    if (rafId || reducedMotionQuery.matches || !loopWidth) return;
    position = viewport.scrollLeft;
    lastTimestamp = null;
    rafId = requestAnimationFrame(autoScrollTick);
  };

  const stopAutoScroll = () => {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
    lastTimestamp = null;
  };

  const applyReducedMotionState = () => {
    track.classList.toggle("pp-services-track--paused", reducedMotionQuery.matches);
    if (reducedMotionQuery.matches) {
      stopAutoScroll();
    } else if (!isHovered && !isDragging) {
      startAutoScroll();
    }
  };

  // Init differito: aspetta il primo layout per avere dimensioni reali
  requestAnimationFrame(() => {
    updateLoopWidth();
    viewport.scrollLeft = 0;
    applyReducedMotionState();
  });

  reducedMotionQuery.addEventListener?.("change", applyReducedMotionState);

  // Drag
  const startDrag = (clientX) => {
    isDragging = true;
    lastPointerX = clientX;
    draggedDistance = 0;
    viewport.classList.add("pp-services-viewport--dragging");
    document.body.style.userSelect = "none";
  };

  const moveDrag = (clientX, event) => {
    if (!isDragging) return;
    const deltaX = clientX - lastPointerX;
    lastPointerX = clientX;
    draggedDistance += Math.abs(deltaX);

    // Calcola e wrappa inline per evitare scrollLeft negativo (il browser lo clamperia a 0)
    let next = viewport.scrollLeft - deltaX;
    if (loopWidth > 0) {
      if (next >= loopWidth) next -= loopWidth;
      else if (next < 0) next += loopWidth;
    }
    viewport.scrollLeft = next;
    event.preventDefault();
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove("pp-services-viewport--dragging");
    document.body.style.userSelect = "";
    if (draggedDistance > dragClickThreshold) suppressClick = true;
    if (!isHovered && !reducedMotionQuery.matches) startAutoScroll();
  };

  // Hover: ferma/riprende il rAF — nessun cambio di posizione, nessun salto
  viewport.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoScroll();
  });

  viewport.addEventListener("mouseleave", () => {
    if (isDragging) return;
    isHovered = false;
    if (!reducedMotionQuery.matches) startAutoScroll();
  });

  // Mouse drag
  viewport.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    startDrag(event.clientX);
  });

  window.addEventListener("mousemove", (event) => {
    moveDrag(event.clientX, event);
  });

  window.addEventListener("mouseup", endDrag);

  // Touch
  viewport.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    isTouchTracking = true;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  viewport.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) return;

    if (!isDragging && isTouchTracking) {
      const dX = Math.abs(touch.clientX - touchStartX);
      const dY = Math.abs(touch.clientY - touchStartY);
      if (dX < dragClickThreshold && dY < dragClickThreshold) return;
      if (dX <= dY) { isTouchTracking = false; return; }
      stopAutoScroll();
      startDrag(touch.clientX);
    }

    if (!isDragging) return;
    isTouchTracking = false;
    moveDrag(touch.clientX, event);
  }, { passive: false });

  const onTouchEnd = () => {
    isTouchTracking = false;
    endDrag();
    if (!isHovered && !reducedMotionQuery.matches) startAutoScroll();
  };

  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);

  // Soppressione click dopo drag
  viewport.addEventListener("click", (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  // Scroll orizzontale con wheel (trackpad)
  viewport.addEventListener("wheel", (event) => {
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);
    if (!absX || absX <= absY) return;
    stopAutoScroll();
    let next = viewport.scrollLeft + event.deltaX;
    if (loopWidth > 0) {
      if (next >= loopWidth) next -= loopWidth;
      else if (next < 0) next += loopWidth;
    }
    viewport.scrollLeft = next;
    event.preventDefault();
  }, { passive: false });

  // Scroll listener: wrap per scroll touch nativo
  viewport.addEventListener("scroll", () => {
    if (!loopWidth || rafId) return;
    wrapScroll();
  }, { passive: true });

  // Resize
  window.addEventListener("resize", () => {
    const wasRunning = !!rafId;
    stopAutoScroll();
    updateLoopWidth();
    if (wasRunning && !reducedMotionQuery.matches) startAutoScroll();
  });
}
