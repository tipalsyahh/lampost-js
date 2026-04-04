document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".info");
    if (!container) return;

    container.insertAdjacentHTML(
        "afterend",
        '<center><button id="loadMore" class="load-more">LOAD MORE</button></center>'
    );

    const loadMoreBtn = document.getElementById("loadMore");

    const filterBtn = document.getElementById("filterBtn");
    const filterCategory = document.getElementById("filterCategory");
    const filterDate = document.getElementById("filterDate");
    const filterMonth = document.getElementById("filterMonth");
    const filterYear = document.getElementById("filterYear");

    const PER_PAGE = 8;
    let page = 1;

    const categoryMap = {};
    const mediaMap = {};
    const editorCache = {};

    function pad(n) {
        return n.toString().padStart(2, "0");
    }

    function formatTanggal(date) {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    function isiDropdown() {

        let htmlDate = "";
        for (let i = 1; i <= 31; i++) {
            htmlDate += `<option value="${i}">${i}</option>`;
        }
        filterDate.innerHTML += htmlDate;

        const bulan = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let htmlMonth = "";
        bulan.forEach((b, i) => {
            htmlMonth += `<option value="${i + 1}">${b}</option>`;
        });
        filterMonth.innerHTML += htmlMonth;

        const yearNow = new Date().getFullYear();

        let htmlYear = "";
        for (let y = yearNow; y >= 2015; y--) {
            htmlYear += `<option value="${y}">${y}</option>`;
        }
        filterYear.innerHTML += htmlYear;

    }

    async function loadCategory() {

        const CACHE_KEY = "kategori_cache";
        const CACHE_TIME = 1000 * 60 * 60 * 24;

        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
            const parsed = JSON.parse(cached);

            if (Date.now() - parsed.time < CACHE_TIME) {

                let html = "";
                parsed.data.forEach(cat => {
                    categoryMap[cat.id] = { name: cat.name, slug: cat.slug };
                    html += `<option value="${cat.id}">${cat.name}</option>`;
                });

                filterCategory.innerHTML += html;

                fetchCategoryBackground();
                return;

            }
        }

        fetchCategoryBackground();

    }

    async function fetchCategoryBackground() {

        try {

            const res = await fetch("https://lampost.co/wp-json/wp/v2/categories?per_page=100");
            const data = await res.json();

            let html = "";
            data.forEach(cat => {
                categoryMap[cat.id] = { name: cat.name, slug: cat.slug };
                html += `<option value="${cat.id}">${cat.name}</option>`;
            });

            filterCategory.innerHTML = '<option value="">Semua Kategori</option>' + html;

            localStorage.setItem("kategori_cache", JSON.stringify({
                time: Date.now(),
                data: data
            }));

        } catch (e) {
            console.log(e);
        }

    }

    function daysInMonth(y, m) {
        return new Date(y, m, 0).getDate();
    }

    function buildDateQuery(url) {

        let y = filterYear.value;
        let m = filterMonth.value;
        let d = filterDate.value;

        if (!y && !m && !d) return url;

        let year = y ? parseInt(y) : new Date().getFullYear();
        let month = m ? parseInt(m) : null;
        let day = d ? parseInt(d) : null;

        let after = "";
        let before = "";

        if (year && month && day) {
            let mm = pad(month);
            let dd = pad(day);
            after = `${year}-${mm}-${dd}T00:00:00`;
            before = `${year}-${mm}-${dd}T23:59:59`;
        }

        else if (year && month && !day) {
            let mm = pad(month);
            let lastDay = daysInMonth(year, month);
            after = `${year}-${mm}-01T00:00:00`;
            before = `${year}-${mm}-${pad(lastDay)}T23:59:59`;
        }

        else if (year && !month && !day) {
            after = `${year}-01-01T00:00:00`;
            before = `${year}-12-31T23:59:59`;
        }

        else if (!y && month && day) {
            let mm = pad(month);
            let dd = pad(day);
            after = `2000-${mm}-${dd}T00:00:00`;
            before = `2100-${mm}-${dd}T23:59:59`;
        }

        else if (!y && month && !day) {
            let mm = pad(month);
            after = `2000-${mm}-01T00:00:00`;
            before = `2100-${mm}-31T23:59:59`;
        }

        else if (!y && !month && day) {
            let dd = pad(day);
            after = `2000-01-${dd}T00:00:00`;
            before = `2100-12-${dd}T23:59:59`;
        }

        url += `&after=${after}&before=${before}`;

        return url;

    }

    async function loadMedia(ids) {

        const uniqueIds = [...new Set(ids.filter(Boolean))];

        await Promise.all(uniqueIds.map(async id => {
            if (mediaMap[id]) return;

            try {
                const res = await fetch(`https://lampost.co/wp-json/wp/v2/media/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    mediaMap[id] = data.source_url;
                }
            } catch (e) { }
        }));

    }

    function fetchEditorsAsync(posts) {

        posts.forEach(async post => {

            const termLink = post._links?.['wp:term']?.[2]?.href;
            if (!termLink) return;

            if (editorCache[termLink]) return;

            try {
                const res = await fetch(termLink);
                if (res.ok) {
                    const data = await res.json();
                    const name = data?.[0]?.name || "Redaksi";
                    editorCache[termLink] = name;

                    document.querySelectorAll(`[data-editor="${termLink}"]`)
                        .forEach(el => el.textContent = `By ${name}`);
                }
            } catch (e) { }

        });

    }

    async function loadPosts(reset = false) {

        if (reset) {
            container.innerHTML = "";
            page = 1;
            loadMoreBtn.style.display = "block";
        }

        let url = `https://lampost.co/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}`;

        if (filterCategory.value) {
            url += `&categories=${filterCategory.value}`;
        }

        url = buildDateQuery(url);

        try {

            const res = await fetch(url);
            const posts = await res.json();

            if (!posts.length) {

                if (page === 1) {
                    container.innerHTML = `<p style="padding:20px;text-align:center;">Berita tidak ditemukan</p>`;
                }

                loadMoreBtn.style.display = "none";
                return;

            }

            await loadMedia(posts.map(p => p.featured_media));

            let html = "";

            posts.forEach(post => {

                const title = post.title.rendered;
                const date = formatTanggal(post.date);

                const catData = categoryMap[post.categories?.[0]] || { name: "Berita", slug: "berita" };
                const catName = catData.name;
                const catSlug = catData.slug;

                const img = mediaMap[post.featured_media] || "image/default.jpg";

                const termLink = post._links?.['wp:term']?.[2]?.href;

                const link = `halaman.html?${catSlug}/${post.slug}`;

                html += `
                <a href="${link}" class="item-berita">
                <img src="${img}">
                <div class="info-berita">
                <p class="judul">${title}</p>
                <p class="kategori">${catName}</p>
                <div class="detail-info">
                <p class="editor" data-editor="${termLink}">By Redaksi</p>
                <p class="tanggal">${date}</p>
                </div>
                </div>
                </a>
                `;

            });

            container.insertAdjacentHTML("beforeend", html);

            fetchEditorsAsync(posts);

            page++;

        } catch (e) {
            console.log(e);
        }

    }

    filterBtn.addEventListener("click", () => {
        loadPosts(true);
    });

    loadMoreBtn.addEventListener("click", () => {
        loadPosts();
    });

    isiDropdown();
    loadCategory();
    loadPosts();

});