gsap.registerPlugin(ScrollToPlugin);

gsap.from(".main-wrapper", { opacity: 0, y: -30, duration: 1, ease: "power3.out" });

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
const lightboxDownload = document.getElementById("lightboxDownload");
const showMoreBtn = document.getElementById("showMoreBtn");

let currentDownloadUrl = "";

let page = 1;
let currentQuery = "";

// Trigger search on click
searchBtn.addEventListener("click", () => {
  const q = input.value.trim();
  if (q) {
    searchImages(q);
  }
});

// Trigger search on Enter key
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = input.value.trim();
    if (q) {
      searchImages(q);
    }
  }
});

tags.forEach(tag =>
  tag.addEventListener("click", () => {
    input.value = tag.dataset.query; // Update input field
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
  
  if (!append) {
    page = 1;
    gallery.innerHTML = "";
    showMoreBtn.classList.add("hidden");
  }
  
  currentQuery = query;
  loading.classList.remove("hidden");
  section.classList.remove("hidden");

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=12&client_id=${accessKey}`
    );
    const data = await res.json();

    loading.classList.add("hidden");

    if (!append && data.results.length === 0) {
      gallery.innerHTML = "<p>No results found.</p>";
      showMoreBtn.classList.add("hidden");
    } else {
      if (data.results.length > 0) {
        showMoreBtn.classList.remove("hidden");
      } else {
        showMoreBtn.classList.add("hidden");
      }
      
      const newImages = [];
      data.results.forEach(imgData => {
        const img = document.createElement("img");
        img.src = imgData.urls.small;
        img.alt = imgData.alt_description || "image";
        img.addEventListener("click", () =>
          showLightbox(imgData.urls.regular, imgData.urls.full)
        );
        gallery.appendChild(img);
        newImages.push(img);
      });

      if (!append) {
        gsap.to(window, {
          duration: 1,
          scrollTo: section.offsetTop - 60,
          ease: "power2.inOut"
        });
      }

      // Animate only the newly added images
      gsap.from(newImages, {
        opacity: 0,
        y: 40,
        scale: 0.9,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.5)",
        clearProps: "all"
      });
    }
  } catch (err) {
    loading.classList.add("hidden");
    if (!append) {
      gallery.innerHTML = `<p>Error loading images. Try again later.</p>`;
    }
    console.error(err);
  }
}

function showLightbox(src, downloadUrl) {
  lightboxImg.src = src;
  currentDownloadUrl = downloadUrl;
  lightbox.classList.add("active");
  // Simple entry animation for lightbox image
  gsap.fromTo(lightboxImg, 
    { scale: 0.8, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
  );
}

function hideLightbox() {
  lightbox.classList.remove("active");
  // Optional tiny delayed clear if necessary
}

lightboxClose.addEventListener("click", hideLightbox);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) hideLightbox();
});

lightboxDownload.addEventListener("click", async () => {
    if (!currentDownloadUrl) return;
    
    try {
        const btnText = lightboxDownload.querySelector('.btn-text');
        const originalText = btnText.innerText;
        btnText.innerText = "Downloading...";
        
        const response = await fetch(currentDownloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "sketch_image_" + Date.now() + ".jpg";
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        btnText.innerText = originalText;
    } catch(err) {
        console.error("Error downloading image:", err);
        window.open(currentDownloadUrl, "_blank"); // Fallback opening in new tab
    }
});
