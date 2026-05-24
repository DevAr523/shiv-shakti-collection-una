// ==========================
// TOKEN CHECK
// ==========================
const token =
localStorage.getItem("token");

if (
    window.location.pathname.includes("admin.html")
    ||
    window.location.pathname.includes("orders.html")
) {

    if (!token) {

        alert("Please login first");

        window.location.href =
        "login.html";
    }
}

// ==========================
// Login
//===========================
async function login() {

    const username =
    document.getElementById(
        "username"
    ).value;

    const password =
    document.getElementById(
        "password"
    ).value;

    try {

        const res =
        await fetch(
            "https://shiv-shakti-backend-h9yl.onrender.com/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data =
        await res.json();

        if (res.ok) {

            localStorage.setItem(
                "token",
                data.token
            );

            alert(
                "Login Success ✅"
            );

            window.location.href =
            "admin.html";

        } else {

            alert(
                data.message
            );
        }

    } catch (error) {

        console.log(error);

        alert(
            "Login failed ❌"
        );
    }
}

// ==========================
// GLOBAL VARIABLES
// ==========================
let products = [];

let filteredProducts = [];

let cart =
JSON.parse(
    localStorage.getItem("cart")
) || [];

let editingId =
null;

// ==========================
// FETCH PRODUCTS
// ==========================
async function fetchProducts() {

    try {

        const res =
        await fetch(
            "https://shiv-shakti-backend-h9yl.onrender.com/products"
        );

        products =
        await res.json();

        filteredProducts =
        [...products];

        // Home page
        if (
            document.getElementById(
                "product-list"
            )
            &&
            !document.getElementById(
                "product-detail"
            )
        ) {

            displayProducts(
                filteredProducts
            );
        }

        // Admin page
        if (
            document.getElementById(
                "list"
            )
        ) {

            loadProducts();
        }

    } catch (error) {

        console.error(
            "Error fetching products:",
            error
        );
    }
}

// ==========================
// DISPLAY PRODUCTS
// ==========================
function displayProducts(
    productArray
) {

    const productList =
    document.getElementById(
        "product-list"
    );

    if (!productList)
    return;

    productList.innerHTML =
    "";

    if (
        productArray.length === 0
    ) {

        productList.innerHTML =
        "<h2>No products found</h2>";

        return;
    }

    productArray.forEach(
    product => {

        productList.innerHTML += `
            <div class="product">

                <img
                src="${product.image}"
                alt="${product.name}"
                >

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ₹${product.price}
                </p>

                <button onclick="viewProduct('${product._id}')">
                    View
                </button>

                <button onclick="addToCart('${product._id}')">
                    Add To Cart
                </button>

            </div>
        `;
    });
}

// ==========================
// SEARCH
// ==========================
const searchBox =
document.querySelector(
    ".search-box"
);

if (searchBox) {

    searchBox.addEventListener(
        "input",
        function () {

            const value =
            this.value
            .toLowerCase();

            const filtered =
            products.filter(
            product =>

                product.name
                .toLowerCase()
                .includes(value)
            );

            displayProducts(
                filtered
            );
        }
    );
}

// ==========================
// CATEGORY FILTER
// ==========================
function filterCategory(
    category
) {

    if (
        category === "All"
    ) {

        filteredProducts =
        [...products];

    } else {

        filteredProducts =
        products.filter(
        product =>

            product.category
            ?.toLowerCase()
            ===
            category
            .toLowerCase()
        );
    }

    displayProducts(
        filteredProducts
    );
}

// ==========================
// GET PRODUCT BY ID
// ==========================
function getProductById(
    id
) {

    return products.find(
        p =>
        p._id == id
    );
}

// ==========================
// VIEW PRODUCT PAGE
// ==========================
function viewProduct(id) {

    localStorage.setItem(
        "selectedProduct",
        id
    );

    window.location.href =
    "product.html";
}

function loadProductPage() {

    const productId =
    localStorage.getItem(
        "selectedProduct"
    );

    if (!productId)
    return;

    const product =
    getProductById(
        productId
    );

    const container =
    document.getElementById(
        "product-detail"
    );

    if (
        container &&
        product
    ) {

        container.innerHTML = `
            <div class="product-page">

                <img
                src="${product.image}"
                class="big-product-image">

                <div>

                    <h1>
                        ${product.name}
                    </h1>

                    <h2>
                        ₹${product.price}
                    </h2>

                    <p>
                        Category:
                        ${
                            product.category
                            || "Fashion"
                        }
                    </p>

                    <button onclick="addToCart('${product._id}')">
                        Add To Cart
                    </button>

                    <button onclick="buyNow('${product._id}')">
                        Buy Now
                    </button>

                </div>

            </div>
        `;
    }
}

// ==========================
// NAVIGATION
// ==========================
function goHome() {

    window.location.href =
    "index.html";
}

function goToCart() {

    window.location.href =
    "cart.html";
}
// ==========================
// CART FUNCTIONS
// ==========================
function addToCart(id) {

    const existing =
    cart.find(
        item =>
        item.id === id
    );

    if (existing) {

        existing.qty += 1;

    } else {

        cart.push({
            id: id,
            qty: 1
        });
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartCount();

    alert(
        "Added To Cart ✅"
    );
}

function updateCartCount() {

    const count =
    document.getElementById(
        "cart-count"
    );

    if (!count)
    return;

    let totalQty =
    0;

    cart.forEach(item => {

        totalQty +=
        item.qty;
    });

    count.innerText =
    totalQty;
}

// ==========================
// DISPLAY CART
// ==========================
function displayCart() {

    const container =
    document.getElementById(
        "cart-container"
    );

    const totalEl =
    document.getElementById(
        "total-price"
    );

    if (!container)
    return;

    container.innerHTML =
    "";

    let total =
    0;

    cart.forEach(
    (item, index) => {

        const product =
        getProductById(
            item.id
        );

        if (!product)
        return;

        total +=
        product.price *
        item.qty;

        container.innerHTML += `
            <div class="cart-item">

                <img
                src="${product.image}"
                width="100">

                <div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ₹${product.price}
                    </p>

                    <p>
                        Quantity:
                        ${item.qty}
                    </p>

                    <button onclick="increaseQty(${index})">
                        +
                    </button>

                    <button onclick="decreaseQty(${index})">
                        -
                    </button>

                    <button onclick="removeFromCart(${index})">
                        Remove
                    </button>

                </div>

            </div>
        `;
    });

    if (totalEl) {

        totalEl.innerText =
        total;
    }
}

// ==========================
// CART ACTIONS
// ==========================
function increaseQty(
    index
) {

    cart[index].qty++;

    saveCart();
}

function decreaseQty(
    index
) {

    if (
        cart[index].qty > 1
    ) {

        cart[index].qty--;

    } else {

        cart.splice(
            index,
            1
        );
    }

    saveCart();
}

function removeFromCart(
    index
) {

    cart.splice(
        index,
        1
    );

    saveCart();
}

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();

    updateCartCount();
}

// ==========================
// CHECKOUT
// ==========================
function goToCheckout() {

    if (
        cart.length === 0
    ) {

        alert(
            "Cart is empty!"
        );

        return;
    }

    window.location.href =
    "checkout.html";
}

// ==========================
// BUY NOW
// ==========================
function buyNow(id) {

    addToCart(id);

    window.location.href =
    "checkout.html";
}

// ==========================
// PLACE ORDER
// ==========================
async function placeOrder() {

    const customerName =
    document.getElementById(
        "customerName"
    )?.value;

    const phone =
    document.getElementById(
        "phone"
    )?.value;

    const address =
    document.getElementById(
        "address"
    )?.value;

    const city =
    document.getElementById(
        "city"
    )?.value;

    const pincode =
    document.getElementById(
        "pincode"
    )?.value;

    if (
        !customerName ||
        !phone ||
        !address ||
        !city ||
        !pincode
    ) {

        alert(
            "Please fill all fields"
        );

        return;
    }

    const items =
    cart.map(item => {

        const product =
        getProductById(
            item.id
        );

        return {

            productId:
            item.id,

            name:
            product?.name
            || "Product",

            price:
            product?.price
            || 0,

            qty:
            item.qty
        };
    });

    const total =
    items.reduce(
        (sum, item) =>

            sum +
            (
                item.price *
                item.qty
            ),

        0
    );

    const orderData = {

        customerName,
        phone,
        address,
        city,
        pincode,

        paymentMethod:
        "Cash On Delivery",

        items,
        total
    };

    try {

        const res =
        await fetch(
            "https://shiv-shakti-backend-h9yl.onrender.com/orders",
            {
                method:
                "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

               body:
                JSON.stringify(
                orderData
                )
                
            }
        );

        if (!res.ok) {

            throw new Error(
                "Order Failed"
            );
        }

        alert(
            "Order Placed Successfully 🚀"
        );

        cart = [];

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        window.location.href =
        "index.html";

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Something went wrong ❌"
        );
    }
}
// ==========================
// ADMIN - SAVE PRODUCT
// ==========================
async function saveProduct() {

    const name =
    document.getElementById(
        "name"
    )?.value;

    const price =
    document.getElementById(
        "price"
    )?.value;

    const image =
    document.getElementById(
        "image"
    )?.files[0];

    const category =
    document.getElementById(
        "category"
    )?.value;

    if (
        !name ||
        !price ||
        !category
    ) {

        alert(
            "Please fill all fields"
        );

        return;
    }

    const url =
    editingId
    ?
    `https://shiv-shakti-backend-h9yl.onrender.com/products/${editingId}`
    :
    `https://shiv-shakti-backend-h9yl.onrender.com/products`;

    const method =
    editingId
    ?
    "PUT"
    :
    "POST";

    try {

        const formData =
        new FormData();

        formData.append(
            "name",
            name
        );

        formData.append(
            "price",
            price
        );

        formData.append(
            "category",
            category
        );

        // only add image if selected
        if (image) {

            formData.append(
                "image",
                image
            );
        }

        const res =
        await fetch(
            url,
            {
                method,

                headers: {
                    "Authorization":
                    token
                },

                body:
                formData
            }
        );

        const data =
        await res.json();

        console.log(data);

        alert(
            editingId
            ?
            "Product Updated ✅"
            :
            "Product Added ✅"
        );

        editingId =
        null;

        document.getElementById(
            "name"
        ).value = "";

        document.getElementById(
            "price"
        ).value = "";

        document.getElementById(
            "image"
        ).value = "";

        document.getElementById(
            "category"
        ).value = "";

        await fetchProducts();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Failed to save product ❌"
        );
    }
}
// ==========================
// ADMIN - LOAD PRODUCTS
// ==========================
function loadProducts() {

    const list =
    document.getElementById(
        "list"
    );

    if (!list)
    return;

    list.innerHTML =
    "";

    products.forEach(
    p => {

        list.innerHTML += `
            <div class="cart-item">

                <img
                src="${p.image}"
                width="100">

                <div>

                    <h3>
                        ${p.name}
                    </h3>

                    <p>
                        ₹${p.price}
                    </p>

                    <p>
                        Category:
                        ${p.category}
                    </p>

                    <button onclick="editProduct('${p._id}')">
                        Edit
                    </button>

                    <button onclick="deleteProduct('${p._id}')">
                        Delete
                    </button>

                </div>

            </div>
        `;
    });
}

// ==========================
// EDIT PRODUCT
// ==========================
function editProduct(
    id
) {

    const product =
    getProductById(id);

    if (!product)
    return;

    editingId =
    id;

    document.getElementById(
        "name"
    ).value =
    product.name;

    document.getElementById(
        "price"
    ).value =
    product.price;
    
    document.getElementById(
        "category"
    ).value =
    product.category;
}

// ==========================
// DELETE PRODUCT
// ==========================
async function deleteProduct(
    id
) {

    const confirmDelete =
    confirm(
        "Delete this product?"
    );

    if (!confirmDelete)
    return;

    try {

        const res =
        await fetch(
            `https://shiv-shakti-backend-h9yl.onrender.com/products/${id}`,
            {
                method:
                "DELETE",

                headers: {
                    "Authorization":
                    token
                }
            }
        );

        const data =
        await res.json();

        console.log(data);

        alert(
            "Deleted ✅"
        );

        fetchProducts();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Delete failed ❌"
        );
    }
}

// ==========================
// LOAD ORDERS
// ==========================
async function loadOrders() {

    const container =
    document.getElementById(
        "orders-container"
    );

    if (!container)
    return;

    try {

        const res =
        await fetch(
            "https://shiv-shakti-backend-h9yl.onrender.com/orders"
        );

        const orders =
        await res.json();

        container.innerHTML =
        "";

        if (
            orders.length === 0
        ) {

            container.innerHTML =
            "<h2>No Orders Yet</h2>";

            return;
        }

        orders.reverse().forEach(
        order => {

            let itemsHTML =
            "";

            order.items.forEach(
            item => {

                itemsHTML += `
                    <li>
                        ${item.name}
                        ×
                        ${item.qty}
                    </li>
                `;
            });

            container.innerHTML += `
                <div class="cart-item">

                    <h2>
                        ${order.customerName}
                    </h2>

                    <p>
                        📞
                        ${order.phone}
                    </p>

                    <p>
                        📍
                        ${order.address},
                        ${order.city}
                        -
                        ${order.pincode}
                    </p>

                    <h3>
                        Products
                    </h3>

                    <ul>
                        ${itemsHTML}
                    </ul>

                    <h3>
                        ₹${order.total}
                    </h3>

                    <p>
                        Payment:
                        ${order.paymentMethod}
                    </p>

                    <p>
                        ${new Date(
                            order.createdAt
                        ).toLocaleString()}
                    </p>

                </div>
            `;
        });

    } catch (error) {

        console.error(
            error
        );
    }
}

// ==========================
// NAVIGATION
// ==========================
function goOrders() {

    window.location.href =
    "orders.html";
}

function goAdmin() {

    window.location.href =
    "admin.html";
}

// ==========================
// LOGOUT
// ==========================
function logout() {

    localStorage.removeItem(
        "token"
    );

    alert(
        "Logged Out ✅"
    );

    window.location.href =
    "login.html";
}

// ==========================
// INIT
// ==========================
async function init() {

    updateCartCount();

    await fetchProducts();

    // Product page
    if (
        document.getElementById(
            "product-detail"
        )
    ) {

        loadProductPage();
    }

    // Cart page
    if (
        document.getElementById(
            "cart-container"
        )
    ) {

        displayCart();
    }

    // Orders page
    if (
        document.getElementById(
            "orders-container"
        )
    ) {

        loadOrders();
        
    }
}

// ==========================
// CLEAR ALL ORDERS
// ==========================
async function clearOrders() {

    const confirmDelete =
    confirm(
        "Delete all orders?"
    );

    if (!confirmDelete)
    return;

    try {

        await fetch(
            "https://shiv-shakti-backend-h9yl.onrender.com/orders",
            {
                method:
                "DELETE"
            }
        );

        alert(
            "All Orders Deleted ✅"
        );

        loadOrders();

    } catch (error) {

        alert(
            "Failed ❌"
        );
    }
}

init();