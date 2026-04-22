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
    const filterEditor = document.getElementById("filterEditor"); // ✅ tambahan

    const PER_PAGE = 15;
    let page = 1;

    const categoryMap = {};
    const mediaMap = {};
    const editorCache = {};

    // ✅ tambahan state filter
    let currentFilter = {
        category: "",
        editor: "",
        date: ""
    };

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
                categoryMap[cat.id] = {
                    name: cat.name,
                    slug: cat.slug,
                    parent: cat.parent
                };

                html += `<option value="${cat.id}">${cat.name}</option>`;
            });

            filterCategory.innerHTML = html;

        } catch (e) {}
    }

    // ✅ tambahan: ambil semua editor
    async function loadEditors() {
        try {
            const res = await fetch("https://lampost.co/wp-json/wp/v2/coauthors?per_page=100");
            const data = await res.json();

            let html = '<option value="">Semua Editor</option>';

            data.forEach(editor => {
                html += `<option value="${editor.id}">${editor.name}</option>`;
            });

            if (filterEditor) {
                filterEditor.innerHTML = html;
            }

        } catch (e) {}
    }

    function buildDateQuery(url) {
        if (!currentFilter.date) return url;

        const date = new Date(currentFilter.date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const after = `${year}-${month}-${day}T00:00:00`;
        const before = `${year}-${month}-${day}T23:59:59`;

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
            } catch (e) {}

        });
    }

    function getMainCategory(post) {

        if (!post.categories || !post.categories.length) {
            return { name: "Berita", slug: "berita", parent: 0 };
        }

        let selected = null;

        post.categories.forEach(id => {
            const cat = categoryMap[id];
            if (!cat) return;

            if (cat.parent !== 0) {
                selected = cat;
            }
        });

        if (!selected) {
            selected = categoryMap[post.categories[0]];
        }

        return selected || { name: "Berita", slug: "berita", parent: 0 };
    }

    async function loadPosts(reset = false) {

        if (Object.keys(categoryMap).length === 0) return;

        if (reset) {
            container.innerHTML = "";
            page = 1;
            loadMoreBtn.style.display = "block";
        }

        let url = `https://lampost.co/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}`;

        // kategori
        if (currentFilter.category) {
            url += `&categories=${currentFilter.category}`;
        }

        // ✅ FIX: editor langsung API
        if (currentFilter.editor) {
            const editorId = parseInt(currentFilter.editor);
            if (!isNaN(editorId)) {
                url += `&coauthors=${editorId}`;
            }
        }

        // tanggal
        url = buildDateQuery(url);

        // DEBUG (boleh hapus nanti)
        console.log("FETCH URL:", url);

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

                const catData = getMainCategory(post);

                const catName = catData.name;
                const catSlug = catData.slug;

                const parentData = categoryMap[catData.parent];

                const img = mediaMap[post.featured_media] || "https://lampost.co/image/ai.jpeg";

                const termLink = post._links?.['wp:term']?.[2]?.href;

                let link = `/${catSlug}/${post.slug}`;

                if (parentData && parentData.slug) {
                    link = `/${parentData.slug}/${catSlug}/${post.slug}`;
                }

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

        } catch (e) {}
    }

    filterBtn.addEventListener("click", () => {

        // simpan state filter
        currentFilter.category = filterCategory.value;
        currentFilter.editor = filterEditor ? filterEditor.value : "";
        currentFilter.date = filterDate.value;

        loadPosts(true);
    });

    loadMoreBtn.addEventListener("click", () => {
        loadPosts();
    });

    (async () => {
        await loadCategory();
        await loadEditors(); // ✅ tambahan
        loadPosts();
    })();

});