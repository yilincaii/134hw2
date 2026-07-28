// gallery-viewer.js
// Powers two things on the About Me (Neo-Chinese) page:
//   1. The inline thumbnail carousels (.thumb-carousel) -- prev/next
//      buttons that step through one photo at a time, looping around.
//   2. A single shared <dialog id="image-viewer"> that opens a larger
//      version of whichever photo was clicked, with its own prev/next
//      and a row of dots.
document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerPrev = document.getElementById("viewer-prev");
  const viewerNext = document.getElementById("viewer-next");
  const viewerClose = document.getElementById("viewer-close");
  const viewerDots = document.getElementById("viewer-dots");
  // Build a list of every image
  const groups = {};
  document.querySelectorAll(".thumb-button").forEach((button) => {
    const groupId = button.dataset.group;
    const img = button.querySelector("img");
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push({ src: img.src, alt: img.alt, button });
  });

  let currentGroup = null;
  let currentIndex = 0;

  //  prev/next steps one photo at a time
  document.querySelectorAll(".thumb-carousel").forEach((carousel) => {
    const groupId = carousel.dataset.group;
    const row = document.getElementById("thumb-row-" + groupId);
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    const items = groups[groupId] || [];

    function scrollToIndex(index) {
      const wrapped = (index + items.length) % items.length;
      row.scrollTo({ left: wrapped * row.clientWidth, behavior: "smooth" });
    }

    prevBtn.addEventListener("click", () => {
      const current = Math.round(row.scrollLeft / row.clientWidth);
      scrollToIndex(current - 1);
    });
    nextBtn.addEventListener("click", () => {
      const current = Math.round(row.scrollLeft / row.clientWidth);
      scrollToIndex(current + 1);
    });
  });

  // Opening the big viewer 
  function openViewer(groupId, index) {
    currentGroup = groupId;
    currentIndex = index;
    showCurrentImage();
    dialog.showModal();
  }

  function showCurrentImage() {
    const items = groups[currentGroup];
    const item = items[currentIndex];

    viewerImage.src = item.src;
    viewerImage.alt = item.alt;
    const hasMultiple = items.length > 1;
    viewerPrev.hidden = !hasMultiple;
    viewerNext.hidden = !hasMultiple;
    viewerDots.hidden = !hasMultiple;
    //fix error and  Rebuild the dots for this group
    viewerDots.innerHTML = "";
    if (hasMultiple) {
      items.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "viewer-dot";
        dot.setAttribute("aria-label", "Image " + (i + 1) + " of " + items.length);
        if (i === currentIndex) {
          dot.setAttribute("aria-current", "true");
        }
        dot.addEventListener("click", () => {
          currentIndex = i;
          showCurrentImage();
        });
        viewerDots.appendChild(dot);
      });
    }
  }
  function showNext() {
    const items = groups[currentGroup];
    currentIndex = (currentIndex + 1) % items.length;
    showCurrentImage();
  }
  function showPrev() {
    const items = groups[currentGroup];
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showCurrentImage();
  }

  // Every thumbnail, in every group, opens the viewer when clicked
  document.querySelectorAll(".thumb-button").forEach((button) => {
    button.addEventListener("click", () => {
      const groupId = button.dataset.group;
      const index = groups[groupId].findIndex((item) => item.button === button);
      openViewer(groupId, index);
    });
  });
  viewerNext.addEventListener("click", showNext);
  viewerPrev.addEventListener("click", showPrev);
  viewerClose.addEventListener("click", () => dialog.close());

  // Arrow keys navigate while the viewer is open
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      showNext();
    } else if (event.key === "ArrowLeft") {
      showPrev();
    }
  });

  // Clicking the backdrop (outside the dialog's own content) closes it
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
});