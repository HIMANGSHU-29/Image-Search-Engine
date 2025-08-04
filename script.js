gsap.registerPlugin(ScrollToPlugin);

gsap.from(".title", { opacity: 0, y: -30, duration: 1 });
gsap.from(".search-box", { opacity: 0, y: 30, delay: 0.5, duration: 1 });

const accessKey = "OiQGB6V8erV876jY3QKdvvwf3963VhNVyA1N0cqU28g";
const searchBtn = document.getElementById("searchBtn");
const input = document.getElementById("searchInput");
const gallery = document.getElementById("gallery");
const section = document.getElementById("gallerySection");
const loading = document.getElementById("loading");
const tags = document.querySelectorAll(".tag");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const showMoreBtn = document.getElementById("showMoreBtn");

let page = 1;
let currentQuery = "";

searchBtn.addEventListener("click", () => {
  page = 1;
  gallery.innerHTML = "";
  searchImages(input.value.trim());
});

tags.forEach(tag =>
  tag.addEventListener("click", () => {
    page = 1;
    gallery.innerHTML = "";
    searchImages(tag.dataset.query);
  })
);

showMoreBtn.addEventListener("click", () => {
  if (currentQuery) {
    page++;
    searchImages(currentQuery, true);
  }
});

async function searchImages(query, append = false) {
  if (!query) return;
  currentQuery = query;
  loading.classList.remove("hidden");
  section.classList.remove("hidden");

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=12&client_id=${accessKey}`
    );
    const data = await res.json();

    loading.classList.add("hidden");
    showMoreBtn.classList.remove("hidden");

    if (!append && data.results.length === 0) {
      gallery.innerHTML = "<p>No results found.</p>";
    } else {
      data.results.forEach(imgData => {
        const img = document.createElement("img");
        img.src = imgData.urls.small;
        img.alt = imgData.alt_description || "image";
        img.addEventListener("click", () =>
          showLightbox(imgData.urls.regular)
        );
        gallery.appendChild(img);
      });

      if (!append) {
        gsap.to(window, {
          duration: 1,
          scrollTo: section.offsetTop - 40,
          ease: "power2.inOut"
        });
      }

      gsap.from(".gallery img", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 1,
        ease: "power2.out"
      });
    }
  } catch (err) {
    loading.classList.add("hidden");
    gallery.innerHTML = `<p>Error loading images. Try again later.</p>`;
    console.error(err);
  }
}

function showLightbox(src) {
  lightboxImg.src = src;
  lightbox.style.display = "flex";
}

function hideLightbox() {
  lightbox.style.display = "none";
}

lightboxClose.addEventListener("click", hideLightbox);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) hideLightbox();
});
