document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".info");
    if (!container) return;

    container.insertAdjacentHTML(
        "beforebegin",
        '<div id="postCount" style="padding:10px;font-size:14px;">Memuat...</div>'
    );

    container.insertAdjacentHTML(
        "afterend",
        '<center><button id="loadMore" class="load-more">LOAD MORE</button></center>'
    );

    const loadMoreBtn = document.getElementById("loadMore");

    const filterBtn = document.getElementById("filterBtn");
    const filterCategory = document.getElementById("filterCategory");
    const filterDate = document.getElementById("filterDate");
    const filterEditor = document.getElementById("filterEditor");

    const PER_PAGE = 15;
    let page = 1;

    const categoryMap = {};
    const mediaMap = {};
    const editorCache = {};

    let currentFilter = {
        category: "",
        editor: "",
        date: ""
    };

    let totalPosts = 0;
    let shownPosts = 0;

    function formatTanggal(date) {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    async function loadCategory() {
        try {
            const res = await fetch("https://lampost.co/wp-json/wp/v2/categories?per_page=100");
            const data = await res.json();

            let html = '<option value="">Semua Berita</option>';

            data.forEach(cat => {
                categoryMap[cat.id] = cat;
                html += `<option value="${cat.id}">${cat.name}</option>`;
            });

            filterCategory.innerHTML = html;
        } catch (e) {}
    }

    async function loadEditors() {
        try {
            const res = await fetch("https://lampost.co/wp-json/wp/v2/coauthors?per_page=100");
            const data = await res.json();

            let html = '<option value="">Semua Editor</option>';

            data.forEach(editor => {
                html += `<option value="${editor.id}">${editor.name}</option>`;
            });

            if (filterEditor) filterEditor.innerHTML = html;

        } catch (e) {}
    }

    function buildDateQuery(url) {
        if (!currentFilter.date) return url;

        const date = new Date(currentFilter.date);

        const after = date.toISOString().split("T")[0] + "T00:00:00";
        const before = date.toISOString().split("T")[0] + "T23:59:59";

        return url + `&after=${after}&before=${before}`;
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
            } catch (e) {}
        }));
    }

    // ✅ FIX UTAMA DI SINI
    function getCoauthorLink(post) {
        const terms = post._links?.['wp:term'];
        if (!terms) return null;

        const coauthor = terms.find(t =>
            t.taxonomy === 'coauthors' ||
            t.taxonomy === 'author' ||
            t.taxonomy === 'coauthor'
        );

        return coauthor?.href || null;
    }

    function fetchEditorsAsync(posts) {

        posts.forEach(async post => {

            const termLink = getCoauthorLink(post);
            if (!termLink) return;

            // cache hit
            if (editorCache[termLink]) {
                renderEditor(termLink, editorCache[termLink]);
                return;
            }

            try {
                const res = await fetch(termLink);
                if (!res.ok) return;

                const data = await res.json();

                if (!Array.isArray(data)) return;

                editorCache[termLink] = data;
                renderEditor(termLink, data);

            } catch (e) {}

        });
    }

    function renderEditor(termLink, data) {

        let name = "Redaksi";

        if (data.length > 0) {

            if (currentFilter.editor) {

                const found = data.find(e => String(e.id) === String(currentFilter.editor));

                if (found) {
                    name = found.name;
                } else {
                    name = data.map(e => e.name).join(", ");
                }

            } else {
                name = data.map(e => e.name).join(", ");
            }
        }

        document.querySelectorAll(`[data-editor="${termLink}"]`)
            .forEach(el => el.textContent = `By ${name}`);
    }

    function getMainCategory(post) {

        if (!post.categories?.length) {
            return { name: "Berita", slug: "berita", parent: 0 };
        }

        let selected = null;

        post.categories.forEach(id => {
            const cat = categoryMap[id];
            if (cat && cat.parent !== 0) selected = cat;
        });

        return selected || categoryMap[post.categories[0]];
    }

    async function loadPosts(reset = false) {

        if (Object.keys(categoryMap).length === 0) return;

        if (reset) {
            container.innerHTML = "";
            page = 1;
            loadMoreBtn.style.display = "block";
            shownPosts = 0;
        }

        let url = `https://lampost.co/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}`;

        if (currentFilter.category) {
            url += `&categories=${currentFilter.category}`;
        }

        if (currentFilter.editor) {
            url += `&coauthors=${currentFilter.editor}`;
        }

        url = buildDateQuery(url);

        try {

            const res = await fetch(url);

            const total = res.headers.get('X-WP-Total');
            if (total) totalPosts = parseInt(total);

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

                const catData = getMainCategory(post);

                const img = mediaMap[post.featured_media] || "https://lampost.co/image/ai.jpeg";

                const termLink = getCoauthorLink(post);

                html += `
                <a href="/${catData.slug}/${post.slug}" class="item-berita">
                    <img src="${img}">
                    <div class="info-berita">
                        <p class="judul">${title}</p>
                        <p class="kategori">${catData.name}</p>
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

            shownPosts += posts.length;

            const countEl = document.getElementById("postCount");
            if (countEl) {
                countEl.innerHTML = `<b>${shownPosts}</b> / ${totalPosts} berita`;
            }

            page++;

        } catch (e) {}
    }

    filterBtn?.addEventListener("click", () => {
        currentFilter.category = filterCategory.value;
        currentFilter.editor = filterEditor?.value || "";
        currentFilter.date = filterDate.value;

        loadPosts(true);
    });

    loadMoreBtn.addEventListener("click", () => {
        loadPosts();
    });

    (async () => {
        await loadCategory();
        await loadEditors();
        loadPosts();
    })();

});