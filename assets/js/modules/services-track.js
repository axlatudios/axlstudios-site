export function setupServicesTrack() {
  const track = document.getElementById("servicesTrack");
  if (!track || !track.parentElement) {
    return;
  }

  const viewport = track.parentElement;
  let cards = Array.from(track.children);
  const baseCount = cards.length;

  if (!baseCount) {
    return;
  }

  function cardWidth() {
    return cards[0].getBoundingClientRect().width;
  }

  function populateClones() {
    const fragStart = document.createDocumentFragment();
    const fragEnd = document.createDocumentFragment();

    cards.forEach((card) => fragEnd.appendChild(card.cloneNode(true)));
    [...cards]
      .reverse()
      .forEach((card) => fragStart.appendChild(card.cloneNode(true)));

    track.insertBefore(fragStart, track.firstChild);
    track.appendChild(fragEnd);
    cards = Array.from(track.children);
  }

  populateClones();

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let previousX = 0;
  let isPointerDown = false;
  let isDraggingHorizontally = false;
  let translate = 0;
  let total = 0;
  let leftLimit = 0;
  let rightLimit = 0;
  let resizeFrame;
  const dragThreshold = 12;

  function recalc() {
    const width = cardWidth();
    total = width * baseCount * 3;
    leftLimit = -total + width * baseCount;
    rightLimit = -(width * baseCount);
    translate = rightLimit;
    track.style.transform = `translateX(${translate}px)`;
  }

  function wrap() {
    const width = cardWidth() * baseCount;
    if (translate < leftLimit) {
      translate += width;
    }
    if (translate > rightLimit) {
      translate -= width;
    }
  }

  function onPointerDown(event) {
    isPointerDown = true;
    document.body.style.userSelect = "none";
    const point = event.touches ? event.touches[0] : event;
    startX = point.clientX;
    startY = point.clientY;
    previousX = startX;
    isDraggingHorizontally = false;
  }

  function onPointerMove(event) {
    if (!isPointerDown) {
      return;
    }

    const point = event.touches ? event.touches[0] : event;
    const deltaX = point.clientX - startX;
    const deltaY = point.clientY - startY;

    if (event.touches && !isDraggingHorizontally) {
      const distanceX = Math.abs(deltaX);
      const distanceY = Math.abs(deltaY);

      if (distanceX < dragThreshold && distanceY < dragThreshold) {
        return;
      }

      if (distanceY > distanceX) {
        onPointerUp();
        return;
      }

      isDraggingHorizontally = true;
      viewport.classList.add("dragging");
    }

    if (!event.touches && !isDraggingHorizontally) {
      isDraggingHorizontally = true;
      viewport.classList.add("dragging");
    }

    currentX = point.clientX;
    translate += currentX - previousX;
    previousX = currentX;
    wrap();
    track.style.transform = `translateX(${translate}px)`;

    if (isDraggingHorizontally) {
      event.preventDefault();
    }
  }

  function onPointerUp() {
    isPointerDown = false;
    isDraggingHorizontally = false;
    viewport.classList.remove("dragging");
    document.body.style.userSelect = "";
  }

  recalc();

  viewport.addEventListener("mousedown", onPointerDown);
  viewport.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  viewport.addEventListener("touchstart", onPointerDown, { passive: false });
  viewport.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);
  viewport.addEventListener("dragstart", (event) => event.preventDefault());

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(recalc);
  });
}
