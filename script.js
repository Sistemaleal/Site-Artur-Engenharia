(function () {
    // =========================
    // WhatsApp (mensagem pronta)
    // =========================
    const phone = "5512996017638"; // +55 12 99601-7638
    const baseMessage =
        "Olá! Quero solicitar orçamento em até 24h.%0A" +
        "Serviço: ____%0A" +
        "Cidade/UF: ____%0A" +
        "Descrição: ____%0A" +
        "Tenho planta/arquivos: ( ) Sim  ( ) Não";

    const waLink = `https://wa.me/${phone}?text=${baseMessage}`;

    const waIds = [
        "ctaWhatsHero",
        "ctaWhatsServices",
        "ctaWhatsContact",
        "footerWhats",
        "waFloat",
    ];

    waIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute("href", waLink);
    });

    // =========================
    // Menu mobile
    // =========================
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.getElementById("navMenu");

    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            const open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });

        menu.querySelectorAll("a").forEach((a) => {
            a.addEventListener("click", () => {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // =========================
    // Portfólio (Carrossel)
    // - lê ./assets/portfolio/portfolio.json
    // - imagens em ./assets/portfolio/<categoria>/<arquivo>
    // =========================
    (async function initPortfolioCarousel() {
        const tabsEl = document.getElementById("portfolioTabs");
        const trackEl = document.getElementById("portfolioTrack");
        const dotsEl = document.getElementById("portfolioDots");
        const titleEl = document.getElementById("portfolioTitle");
        const descEl = document.getElementById("portfolioDesc");
        const prevBtn = document.getElementById("pfPrev");
        const nextBtn = document.getElementById("pfNext");
        const frameEl = document.getElementById("portfolioFrame");

        // Se a seção não existir, não faz nada
        if (!tabsEl || !trackEl || !dotsEl || !titleEl || !descEl || !prevBtn || !nextBtn || !frameEl) return;

        let categories = [];
        try {
            const res = await fetch("./assets/portfolio/portfolio.json", { cache: "no-cache" });
            const data = await res.json();
            categories = data.categories || [];
        } catch (err) {
            console.warn("Não foi possível carregar assets/portfolio/portfolio.json.", err);
            titleEl.textContent = "Portfólio";
            descEl.textContent = "— Adicione o arquivo portfolio.json para ativar o carrossel.";
            return;
        }

        if (!categories.length) {
            titleEl.textContent = "Portfólio";
            descEl.textContent = "— Adicione categorias em assets/portfolio/portfolio.json.";
            return;
        }

        let activeCat = categories[0];
        let index = 0;

        function setCaption(cat) {
            titleEl.textContent = cat.title || cat.label || "Portfólio";
            descEl.textContent = cat.desc ? `— ${cat.desc}` : "";
        }

        function preloadNeighbors() {
            // pré-carrega slide anterior e próximo (melhora a fluidez)
            const imgs = activeCat.images || [];
            if (!imgs.length) return;

            const toPreload = [index - 1, index + 1].map((i) => (i + imgs.length) % imgs.length);
            toPreload.forEach((i) => {
                const src = `./assets/portfolio/${activeCat.id}/${imgs[i]}`;
                const img = new Image();
                img.src = src;
            });
        }

        function goTo(i, noAnim = false) {
            const total = (activeCat.images || []).length;
            if (!total) return;

            index = (i + total) % total;

            if (noAnim) trackEl.style.transition = "none";
            trackEl.style.transform = `translateX(${-index * 100}%)`;
            if (noAnim) requestAnimationFrame(() => (trackEl.style.transition = ""));

            // Atualiza dots
            [...dotsEl.children].forEach((d, di) => d.classList.toggle("is-active", di === index));

            preloadNeighbors();
        }

        function renderTabs() {
            tabsEl.innerHTML = "";
            categories.forEach((cat, i) => {
                const btn = document.createElement("button");
                btn.className = "tabBtn";
                btn.type = "button";
                btn.role = "tab";
                btn.setAttribute("aria-selected", cat.id === activeCat.id ? "true" : "false");
                btn.textContent = cat.label || `Categoria ${i + 1}`;

                btn.addEventListener("click", () => {
                    activeCat = cat;
                    index = 0;
                    renderTabs();
                    renderSlides();
                });

                tabsEl.appendChild(btn);
            });
        }

        function renderSlides() {
            const imgs = activeCat.images || [];
            trackEl.innerHTML = "";
            dotsEl.innerHTML = "";

            if (!imgs.length) {
                trackEl.innerHTML = `
          <div class="pfSlide">
            <div class="pfSlide__inner" style="padding:18px;">
              <p class="muted" style="margin:0;">Nenhuma imagem cadastrada nesta categoria.</p>
            </div>
          </div>
        `;
                setCaption(activeCat);
                return;
            }


                        imgs.forEach((imgName, i) => {
                                const slide = document.createElement("div");
                                slide.className = "pfSlide";
                                const src = `./assets/portfolio/${activeCat.id}/${imgName}`;
                                let inner = "";
                                if (imgName.toLowerCase().endsWith('.pdf')) {
                                        inner = `
                    <div class="pfSlide__inner">
                        <iframe src="${src}#toolbar=0" 
                                        title="${(activeCat.title || activeCat.label || "Portfólio")} — prancha PDF ${i + 1}"
                                        style="width:100%;height:420px;border:none;background:#222;"
                                        loading="lazy"
                                        allowfullscreen></iframe>
                    </div>
                `;
                                } else {
                                        inner = `
                    <div class="pfSlide__inner">
                        <img loading="lazy"
                                 alt="${(activeCat.title || activeCat.label || "Portfólio")} — imagem ${i + 1}"
                                 src="${src}">
                    </div>
                `;
                                }
                                slide.innerHTML = inner;
                                trackEl.appendChild(slide);

                                const dot = document.createElement("button");
                                dot.className = "dot" + (i === index ? " is-active" : "");
                                dot.type = "button";
                                dot.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
                                dot.addEventListener("click", () => goTo(i));
                                dotsEl.appendChild(dot);
                        });

            setCaption(activeCat);
            goTo(0, true);
        }

        // Botões
        prevBtn.addEventListener("click", () => goTo(index - 1));
        nextBtn.addEventListener("click", () => goTo(index + 1));

        // Teclado (melhor acessibilidade)
        frameEl.setAttribute("tabindex", "0");
        frameEl.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") goTo(index - 1);
            if (e.key === "ArrowRight") goTo(index + 1);
        });

        // Swipe / Drag com Pointer Events
        let startX = 0;
        let deltaX = 0;
        let isDown = false;

        frameEl.addEventListener("pointerdown", (e) => {
            isDown = true;
            startX = e.clientX;
            deltaX = 0;
            frameEl.setPointerCapture?.(e.pointerId);
        });

        frameEl.addEventListener("pointermove", (e) => {
            if (!isDown) return;
            deltaX = e.clientX - startX;
        });

        frameEl.addEventListener("pointerup", () => {
            if (!isDown) return;
            isDown = false;

            // threshold
            if (Math.abs(deltaX) > 50) {
                if (deltaX < 0) goTo(index + 1);
                else goTo(index - 1);
            }
        });

        // Init
        renderTabs();
        renderSlides();
    })();
})();

// Zoom simples no portfólio (clique para ampliar/reduzir)
document.addEventListener("click", (e) => {
    const img = e.target.closest(".pfSlide img");
    if (!img) return;

    const zoomed = img.getAttribute("data-zoom") === "1";
    img.style.transformOrigin = "center center";
    img.style.transform = zoomed ? "scale(1)" : "scale(1.6)";
    img.style.transition = "transform .18s ease";
    img.setAttribute("data-zoom", zoomed ? "0" : "1");
});