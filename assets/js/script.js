function checkLogin() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("You must be logged in to access this page!");
        window.location.href = "login.html";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const foodItems = document.querySelectorAll(".food-item");

    searchInput.addEventListener("input", () => {
        const searchText = searchInput.value.toLowerCase();
        foodItems.forEach(item => {
            const itemName = item.querySelector(".card-title").textContent.toLowerCase();
            item.style.display = itemName.includes(searchText) ? "block" : "none";
        });
    });

    categoryFilter.addEventListener("change", () => {
        const category = categoryFilter.value;
        foodItems.forEach(item => {
            if (category === "all" || item.dataset.category === category) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("adminLoginForm");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("errorMessage");

        const adminUser = "admin";
        const adminPass = "password123";

        if (username === adminUser && password === adminPass) {
            window.location.href = "admin.html";
        } else {
            errorMessage.style.display = "block";
        }
    });
});

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
});*/


document.addEventListener("DOMContentLoaded", function () {
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    addToCartButtons.forEach(button => {
        button.addEventListener("click", function () {
            const card = this.closest(".card");
            const itemName = card.querySelector(".card-title").textContent;
            const itemPrice = card.querySelector(".card-text").textContent.replace("$", "");
            const itemImage = card.querySelector("img").src;

            const item = {
                name: itemName,
                price: parseFloat(itemPrice),
                image: itemImage,
                quantity: 1
            };

            addToCart(item);
        });
    });

    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        let existingItem = cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${item.name} has been added to your cart!`);
    }
});


document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:3000/random-dishes")
        .then(response => response.json())
        .then(data => {
            const popularDishesContainer = document.getElementById("popular-dishes");
            popularDishesContainer.innerHTML = ""; // Clear existing content

            data.forEach(dish => {
                let dishCard = document.createElement("div");
                dishCard.classList.add("col-md-4");
                dishCard.innerHTML = `
                    <div class="card">
                        <img src="http://localhost:3000${dish.image}" class="card-img-top" alt="${dish.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text">GH₵ ${dish.price.toFixed(2)}</p>
                            <button class="btn btn-success" onclick="addToCart(${dish.id})">Add to Cart</button>
                        </div>
                    </div>
                `;
                popularDishesContainer.appendChild(dishCard);
            });
        })
        .catch(error => console.error("Error fetching random dishes:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:3000/foods")
        .then(response => response.json())
        .then(data => {
            const foodMenuContainer = document.getElementById("foodMenu");
            foodMenuContainer.innerHTML = ""; // Clear existing content

            data.forEach(food => {
                let foodCard = document.createElement("div");
                foodCard.classList.add("col-md-4", "food-item");
                foodCard.setAttribute("data-category", food.category || "general");

                foodCard.innerHTML = `
                    <div class="card">
                        <img src="http://localhost:3000${food.image}" class="card-img-top" alt="${food.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${food.name}</h5>
                            <p class="card-text">GH₵ ${food.price.toFixed(2)}</p>
                            <button class="btn btn-success" onclick="addToCart('${food.name}', ${food.price}, 'http://localhost:3000${food.image}')">Add to Cart</button>
                        </div>
                    </div>
                `;
                foodMenuContainer.appendChild(foodCard);
            });
        })
        .catch(error => console.error("Error fetching food items:", error));
});

// Function to fetch and display search results
function searchFood() {
    let searchQuery = document.getElementById("searchInput").value.trim();

    fetch(`http://localhost:3000/search-food?q=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            const foodMenuContainer = document.getElementById("foodMenu");
            foodMenuContainer.innerHTML = "";

            if (data.length === 0) {
                foodMenuContainer.innerHTML = "<p class='text-center'>No food items found.</p>";
                return;
            }

            data.forEach(food => {
                let foodCard = document.createElement("div");
                foodCard.classList.add("col-md-4", "food-item");
                foodCard.innerHTML = `
                    <div class="card">
                        <img src="http://localhost:3000${food.image}" class="card-img-top" alt="${food.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${food.name}</h5>
                            <p class="card-text">GH₵ ${food.price.toFixed(2)}</p>
                            <button class="btn btn-success" onclick="addToCart('${food.name}', ${food.price}, 'http://localhost:3000${food.image}')">Add to Cart</button>
                        </div>
                    </div>
                `;
                foodMenuContainer.appendChild(foodCard);
            });
        })
        .catch(error => console.error("Error fetching search results:", error));
}

//const user_id = localStorage.getItem("user_id") || "guest123"; 
function addToCart(food_id) {
    fetch("http://localhost:3000/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, food_id, quantity: 1 }),
    })
    .then(response => response.json())
    .then(() => alert("Item added to cart!"))
    .catch(error => console.error("Error adding to cart:", error));
}

// Fetch and display cart items
function displayCart() {
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

            cartTotal.textContent = total.toFixed(2);
        })
        .catch(error => console.error("Error fetching cart:", error));
}

// Remove an item from the cart
function removeFromCart(cart_id) {
    fetch(`http://localhost:3000/cart/${user_id}/${cart_id}`, { method: "DELETE" })
        .then(() => displayCart())
        .catch(error => console.error("Error removing item:", error));
}

// Clear the cart
function clearCart() {
    fetch(`http://localhost:3000/cart/${user_id}`, { method: "DELETE" })
        .then(() => displayCart())
        .catch(error => console.error("Error clearing cart:", error));
}