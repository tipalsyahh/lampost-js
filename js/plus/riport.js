document.addEventListener("DOMContentLoaded", () => {

    const API = "https://lampost.co/wp-json/wp/v2";

    const container = document.querySelector(".info");

    if (!container) return;

    container.insertAdjacentHTML(
        "beforebegin",
        `
        <div id="postCount" class="post-count">
            Memuat...
        </div>
        `
    );

    container.insertAdjacentHTML(
        "afterend",
        `
        <center>
            <button id="loadMore" class="load-more">
                LOAD MORE
            </button>
        </center>
        `
    );

    const loadMoreBtn = document.getElementById("loadMore");

    const filterBtn = document.getElementById("filterBtn");

    const filterCategory = document.getElementById("filterCategory");

    const filterAuthor = document.getElementById("filterAuthor");

    const filterEditor = document.getElementById("filterEditor");

    const filterDate = document.getElementById("filterDate");

    const PER_PAGE = 15;

    let page = 1;

    let totalPosts = 0;

    let shownPosts = 0;

    const currentFilter = {
        category: "",
        author: "",
        editor: "",
        date: ""
    };

    const categoryMap = {};

    const mediaMap = {};

    const authorMap = {};

    const editorCache = {};

    function formatTanggal(dateString) {

        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");

        const month = String(date.getMonth() + 1).padStart(2, "0");

        const year = date.getFullYear();

        return `${day}/${month}/${year}`;

    }

    function resetList() {

        page = 1;

        shownPosts = 0;

        container.innerHTML = "";

        loadMoreBtn.style.display = "block";

    }

    function updateCounter() {

        const counter = document.getElementById("postCount");

        if (!counter) return;

        counter.innerHTML = `<b>${shownPosts}</b> / ${totalPosts} berita`;

    }

    function buildDateQuery(url) {

        if (!currentFilter.date) {

            return url;

        }

        const date = new Date(currentFilter.date);

        const y = date.getFullYear();

        const m = String(date.getMonth() + 1).padStart(2, "0");

        const d = String(date.getDate()).padStart(2, "0");

        const after = `${y}-${m}-${d}T00:00:00`;

        const before = `${y}-${m}-${d}T23:59:59`;

        return `${url}&after=${after}&before=${before}`;

    }

    async function loadCategory() {

        try {

            const res = await fetch(`${API}/categories?per_page=100`);

            const categories = await res.json();

            let html = `<option value="">Semua Berita</option>`;

            categories.forEach(category => {

                categoryMap[category.id] = {

                    id: category.id,

                    name: category.name,

                    slug: category.slug,

                    parent: category.parent

                };

                html += `
                    <option value="${category.id}">
                        ${category.name}
                    </option>
                `;

            });

            if (filterCategory) {

                filterCategory.innerHTML = html;

            }

        } catch (err) {

            console.log(err);

        }

    }

    async function loadAuthors() {

        try {

            const res = await fetch(`${API}/coauthors?per_page=100`);

            const authors = await res.json();

            let html = `<option value="">Semua Penulis</option>`;

            authors.forEach(author => {

                authorMap[author.id] = author;

                html += `
                    <option value="${author.id}">
                        ${author.name}
                    </option>
                `;

            });

            if (filterAuthor) {

                filterAuthor.innerHTML = html;

            }

        } catch (err) {

            console.log(err);

        }

    }
    
    async function loadEditors() {

        if (!filterEditor) return;

        try {

            const res = await fetch(`${API}/coauthors?per_page=100`);

            const editors = await res.json();

            let html = `<option value="">Semua Editor</option>`;

            editors.forEach(editor => {

                html += `
                    <option value="${editor.id}">
                        ${editor.name}
                    </option>
                `;

            });

            filterEditor.innerHTML = html;

        } catch (err) {

            console.log(err);

        }

    }

    async function loadMedia(ids) {

        const uniqueIds = [...new Set(ids.filter(Boolean))];

        await Promise.all(

            uniqueIds.map(async id => {

                if (mediaMap[id]) return;

                try {

                    const res = await fetch(`${API}/media/${id}`);

                    if (!res.ok) return;

                    const media = await res.json();

                    mediaMap[id] = media.source_url;

                } catch (err) {

                    mediaMap[id] = "https://lampost.co/image/ai.jpeg";

                }

            })

        );

    }

    function getMainCategory(post) {

        if (!post.categories || !post.categories.length) {

            return {

                name: "Berita",

                slug: "berita",

                parent: 0

            };

        }

        let selected = null;

        post.categories.forEach(id => {

            const category = categoryMap[id];

            if (!category) return;

            if (category.parent !== 0) {

                selected = category;

            }

        });

        if (!selected) {

            selected = categoryMap[post.categories[0]];

        }

        return selected || {

            name: "Berita",

            slug: "berita",

            parent: 0

        };

    }

    async function validateEditor(post, editorId) {

        const termLink = post._links?.["wp:term"]?.[2]?.href;

        if (!termLink) {

            return false;

        }

        if (editorCache[termLink]) {

            return editorCache[termLink]
                .some(item => String(item.id) === String(editorId));

        }

        try {

            const res = await fetch(termLink);

            const data = await res.json();

            editorCache[termLink] = data;

            return data.some(item => String(item.id) === String(editorId));

        } catch (err) {

            return false;

        }

    }

    function fetchEditorsAsync(posts) {

        posts.forEach(async post => {

            const termLink = post._links?.["wp:term"]?.[2]?.href;

            if (!termLink) return;

            let editors = editorCache[termLink];

            if (!editors) {

                try {

                    const res = await fetch(termLink);

                    editors = await res.json();

                    editorCache[termLink] = editors;

                } catch (err) {

                    return;

                }

            }

            let editorName = "Redaksi";

            if (Array.isArray(editors) && editors.length) {

                editorName = editors
                    .map(item => item.name)
                    .join(", ");

            }

            document
                .querySelectorAll(`[data-editor="${termLink}"]`)
                .forEach(el => {

                    el.textContent = `By ${editorName}`;

                });

        });

    }

    function buildPostLink(post) {

        const category = getMainCategory(post);

        const parent = categoryMap[category.parent];

        if (parent) {

            return `/${parent.slug}/${category.slug}/${post.slug}`;

        }

        return `/${category.slug}/${post.slug}`;

    }

    function getThumbnail(post) {

        if (mediaMap[post.featured_media]) {

            return mediaMap[post.featured_media];

        }

        return "https://lampost.co/image/ai.jpeg";

    }

    function getCategoryName(post) {

        return getMainCategory(post).name;

    }

    function getCategorySlug(post) {

        return getMainCategory(post).slug;

    }
        async function loadPosts(reset = false) {

        if (Object.keys(categoryMap).length === 0) {
            return;
        }

        if (reset) {
            resetList();
        }

        let url = `${API}/posts?per_page=${PER_PAGE}&page=${page}`;

        if (currentFilter.category) {

            url += `&categories=${currentFilter.category}`;

        }

        if (currentFilter.author) {

            const authorId = parseInt(currentFilter.author);

            if (!isNaN(authorId)) {

                url += `&coauthors=${authorId}`;

            }

        }

        url = buildDateQuery(url);

        let response;

        try {

            response = await fetch(url);

        } catch (err) {

            console.log(err);

            loadMoreBtn.style.display = "none";

            return;

        }

        if (!response.ok) {

            loadMoreBtn.style.display = "none";

            return;

        }

        const total = response.headers.get("X-WP-Total");

        if (total) {

            totalPosts = parseInt(total);

        }

        let posts = await response.json();

        if (!Array.isArray(posts)) {

            posts = [];

        }

        if (currentFilter.editor) {

            const filteredPosts = [];

            for (const post of posts) {

                const valid = await validateEditor(
                    post,
                    currentFilter.editor
                );

                if (valid) {

                    filteredPosts.push(post);

                }

            }

            posts = filteredPosts;

        }

        if (!posts.length) {

            if (page === 1) {

                container.innerHTML = `
                    <div class="empty-news">
                        Berita tidak ditemukan
                    </div>
                `;

            }

            loadMoreBtn.style.display = "none";

            updateCounter();

            return;

        }

        await loadMedia(

            posts.map(post => post.featured_media)

        );

        let html = "";
                posts.forEach(post => {

            const title = post.title.rendered;

            const date = formatTanggal(post.date);

            const category = getMainCategory(post);

            const categoryName = category.name;

            const image = getThumbnail(post);

            const link = buildPostLink(post);

            const termLink = post._links?.["wp:term"]?.[2]?.href || "";

            html += `
                <a href="${link}" class="item-berita">

                    <img
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                    >

                    <div class="info-berita">

                        <p class="judul">
                            ${title}
                        </p>

                        <p class="kategori">
                            ${categoryName}
                        </p>

                        <div class="detail-info">

                            <p
                                class="editor"
                                data-editor="${termLink}"
                            >
                                By Redaksi
                            </p>

                            <p class="tanggal">
                                ${date}
                            </p>

                        </div>

                    </div>

                </a>
            `;

        });

        container.insertAdjacentHTML(
            "beforeend",
            html
        );

        fetchEditorsAsync(posts);

        shownPosts += posts.length;

        updateCounter();

        page++;

        if (shownPosts >= totalPosts) {

            loadMoreBtn.style.display = "none";

        } else {

            loadMoreBtn.style.display = "block";

        }

    }
        if (filterBtn) {

        filterBtn.addEventListener("click", () => {

            currentFilter.category = filterCategory
                ? filterCategory.value
                : "";

            currentFilter.author = filterAuthor
                ? filterAuthor.value
                : "";

            currentFilter.editor = filterEditor
                ? filterEditor.value
                : "";

            currentFilter.date = filterDate
                ? filterDate.value
                : "";

            loadPosts(true);

        });

    }

    if (loadMoreBtn) {

        loadMoreBtn.addEventListener("click", () => {

            loadPosts();

        });

    }

    async function init() {

        loadMoreBtn.disabled = true;

        loadMoreBtn.textContent = "Loading...";

        try {

            await Promise.all([
                loadCategory(),
                loadAuthors(),
                loadEditors()
            ]);

            await loadPosts(true);

        } catch (err) {

            console.error(err);

            container.innerHTML = `
                <div class="empty-news">
                    Gagal mengambil data berita.
                </div>
            `;

        }

        loadMoreBtn.disabled = false;

        loadMoreBtn.textContent = "LOAD MORE";

    }

    init();

});
