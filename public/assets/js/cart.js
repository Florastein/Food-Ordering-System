/*document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    let cart = [
        { name: "Classic Burger", price: 5.99, quantity: 2 },
        { name: "Fresh Juice", price: 2.99, quantity: 1 }
    ];

    function updateCart() {
        cartItems.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            const row = document.createElement("tr");
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" class="form-control text-center quantity" value="${item.quantity}" min="1" data-index="${index}">
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm remove-item" data-index="${index}">Remove</button></td>
            `;

            cartItems.appendChild(row);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    cartItems.addEventListener("input", (e) => {
        if (e.target.classList.contains("quantity")) {
            const index = e.target.getAttribute("data-index");
            cart[index].quantity = parseInt(e.target.value);
            updateCart();
        }
    });

    cartItems.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-item")) {
            const index = e.target.getAttribute("data-index");
            cart.splice(index, 1);
            updateCart();
        }
    });

    updateCart();
});
*/

/*document.addEventListener("DOMContentLoaded", function () {
    displayCart();

    document.getElementById("clear-cart").addEventListener("click", function () {
        localStorage.removeItem("cart");
        displayCart();
    });

    function displayCart() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let cartItemsContainer = document.getElementById("cart-items");
        let cartTotal = document.getElementById("cart-total");

        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p class='text-center'>Your cart is empty.</p>";
        } else {
            cart.forEach(item => {
                let itemTotal = item.price * item.quantity;
                total += itemTotal;

                cartItemsContainer.innerHTML += `
                    <div class="row mb-3">
                        <div class="col-md-2">
                            <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
                        </div>
                        <div class="col-md-4 d-flex align-items-center">
                            <h5>${item.name}</h5>
                        </div>
                        <div class="col-md-2 d-flex align-items-center">
                            <p>$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="col-md-2 d-flex align-items-center">
                            <input type="number" class="form-control quantity" data-name="${item.name}" value="${item.quantity}" min="1">
                        </div>
                        <div class="col-md-2 d-flex align-items-center">
                            <button class="btn btn-danger remove-item" data-name="${item.name}">Remove</button>
                        </div>
                    </div>
                `;
            });
        }

        cartTotal.textContent = total.toFixed(2);

        document.querySelectorAll(".quantity").forEach(input => {
            input.addEventListener("change", function () {
                updateQuantity(this.dataset.name, this.value);
            });
        });

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                removeFromCart(this.dataset.name);
            });
        });
    }

    function updateQuantity(name, quantity) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let item = cart.find(item => item.name === name);
        if (item) {
            item.quantity = parseInt(quantity);
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        }
    }

    function removeFromCart(name) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.name !== name);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    }
});*/

document.addEventListener("DOMContentLoaded", function () {
    fetchCart();

    function fetchCart() {
        let user_id = localStorage.getItem("user_id") || "guest123"; // Ensure user ID is available

        fetch(`http://localhost:3000/cart/${user_id}`)
            .then(response => response.json())
            .then(data => {
                const cartTable = document.getElementById("cartItems");
                const cartTotal = document.getElementById("cartTotal");
                cartTable.innerHTML = "";
                let total = 0;

                if (data.length === 0) {
                    cartTable.innerHTML = "<tr><td colspan='6' class='text-center'>Your cart is empty.</td></tr>";
                } else {
                    data.forEach(item => {
                        let itemTotal = item.price * item.quantity;
                        total += itemTotal;
                        cartTable.innerHTML += `
                            <tr>
                                <td><img src="http://localhost:3000${item.image}" width="50"></td>
                                <td>${item.name}</td>
                                <td>GH₵ ${item.price.toFixed(2)}</td>
                                <td>
                                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                                    ${item.quantity}
                                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                                </td>
                                <td>GH₵ ${itemTotal.toFixed(2)}</td>
                                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Remove</button></td>
                            </tr>
                        `;
                    });
                }

                cartTotal.textContent = total.toFixed(2);
            })
            .catch(error => console.error("Error fetching cart:", error));
    }

    window.updateQuantity = function (cart_id, change) {
        let user_id = localStorage.getItem("user_id") || "guest123";

        fetch(`http://localhost:3000/update-cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, cart_id, change }),
        })
        .then(() => fetchCart())
        .catch(error => console.error("Error updating cart:", error));
    };

    window.removeFromCart = function (cart_id) {
        let user_id = localStorage.getItem("user_id") || "guest123";

        fetch(`http://localhost:3000/cart/${user_id}/${cart_id}`, { method: "DELETE" })
        .then(() => fetchCart())
        .catch(error => console.error("Error removing item:", error));
    };
});

function checkLogin() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("You must be logged in to access this page!");
        window.location.href = "public/login.html";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    checkLogin(); // Ensure the user is logged in before accessing the cart
    displayCart();
});

function displayCart() {
    const user_id = localStorage.getItem("user_id");
    fetch(`http://localhost:3000/cart/${user_id}`)
        .then(response => response.json())
        .then(data => {
            const cartItemsContainer = document.getElementById("cart-items");
            const cartTotal = document.getElementById("cart-total");
            cartItemsContainer.innerHTML = "";
            let total = 0;

            if (data.length === 0) {
                cartItemsContainer.innerHTML = "<p class='text-center'>Your cart is empty.</p>";
            } else {
                data.forEach(item => {
                    total += item.price * item.quantity;
                    cartItemsContainer.innerHTML += `
                        <div class="row mb-3">
                            <div class="col-md-2"><img src="http://localhost:3000${item.image}" width="50"></div>
                            <div class="col-md-4">${item.name}</div>
                            <div class="col-md-2">GH₵ ${item.price.toFixed(2)}</div>
                            <div class="col-md-2">${item.quantity}</div>
                            <div class="col-md-2">
                                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Remove</button>
                            </div>
                        </div>
                    `;
                });
            }

            cartTotal.textContent = `GH₵ ${total.toFixed(2)}`;
        })
        .catch(error => console.error("Error fetching cart:", error));
}
