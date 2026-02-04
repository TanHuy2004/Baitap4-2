const API = "https://api.escuelajs.co/api/v1/products";
const FALLBACK = "https://via.placeholder.com/60x60?text=No+Image";

let allProducts = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortDir = "asc";

fetch(API)
    .then(r => r.json())
    .then(d => {
        allProducts = d;
        filtered = [...d];
        render();
    });

function render() {
    const tb = document.getElementById("productTable");
    tb.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    filtered.slice(start, start + pageSize).forEach(p => {
        tb.innerHTML += `
        <tr onclick="openDetail(${p.id})" title="${p.description || ""}">
            <td class="text-center">${p.id}</td>
            <td>${p.title}</td>
            <td class="text-center">${p.price}</td>
            <td>${p.category?.name || ""}</td>
            <td class="text-center">
                <img src="${p.images?.[0] || FALLBACK}"
                     class="product-img"
                     onerror="this.src='${FALLBACK}'">
            </td>
        </tr>`;
    });

    renderPagination();
}

function renderPagination() {
    const total = Math.ceil(filtered.length / pageSize);
    pagination.innerHTML = "";
    for (let i = 1; i <= total; i++) {
        pagination.innerHTML += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
            <a class="page-link" onclick="goPage(${i})">${i}</a>
        </li>`;
    }
}

function goPage(p) { currentPage = p; render(); }
function changePageSize(v) { pageSize = +v; currentPage = 1; render(); }

function searchTitle(text) {
    filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(text.toLowerCase())
    );
    currentPage = 1;
    render();
}

function sortBy(field) {
    sortDir = (sortField === field && sortDir === "asc") ? "desc" : "asc";
    sortField = field;
    filtered.sort((a, b) =>
        sortDir === "asc"
            ? a[field] > b[field] ? 1 : -1
            : a[field] < b[field] ? 1 : -1
    );
    render();
}

/* DETAIL */
function openDetail(id) {
    const p = allProducts.find(x => x.id === id);
    eid.value = p.id;
    etitle.value = p.title;
    eprice.value = p.price;
    edesc.value = p.description;
    eimg.src = p.images?.[0] || FALLBACK;
    new bootstrap.Modal(detailModal).show();
}

/* UPDATE */
function updateProduct() {
    const id = eid.value;
    fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: etitle.value,
            price: +eprice.value,
            description: edesc.value
        })
    }).then(() => {
        alert("✅ Updated (Fake API)");
        const i = allProducts.findIndex(p => p.id == id);
        allProducts[i].title = etitle.value;
        allProducts[i].price = +eprice.value;
        allProducts[i].description = edesc.value;
        render();
        bootstrap.Modal.getInstance(detailModal).hide();
    });
}

/* CREATE */
function openCreateModal() {
    new bootstrap.Modal(createModal).show();
}

function createProduct() {
    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: ctitle.value,
            price: +cprice.value,
            description: cdesc.value,
            categoryId: +ccate.value,
            images: [cimg.value]
        })
    })
    .then(r => r.json())
    .then(p => {
        alert("✅ Created (Fake API)");
        allProducts.unshift(p);
        filtered = [...allProducts];
        render();
        bootstrap.Modal.getInstance(createModal).hide();
    });
}

/* CSV */
function exportCSV() {
    const start = (currentPage - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    let csv = "ID,Title,Price,Category\n";
    data.forEach(p =>
        csv += `${p.id},"${p.title}",${p.price},"${p.category?.name || ""}"\n`
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = "products.csv";
    a.click();
}
