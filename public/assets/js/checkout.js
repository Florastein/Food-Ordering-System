document.addEventListener("DOMContentLoaded", () => {
    const orderSummary = document.getElementById("order-summary");
    const totalPrice = document.getElementById("total-price");

    const cart = [
        { name: "Classic Burger", price: 5.99 },
        { name: "Fresh Juice", price: 2.99 },
    ];

    let total = 0;
    cart.forEach(item => {
        total += item.price;
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `${item.name} <span>$${item.price.toFixed(2)}</span>`;
        orderSummary.appendChild(li);
    });

    totalPrice.textContent = `$${total.toFixed(2)}`;

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Order placed successfully!");
        window.location.href = "thank-you.html";
    });
});


document.addEventListener("DOMContentLoaded", function () {
    checkLogin(); // Ensure user is logged in

    fetchCartForCheckout();

    document.getElementById("checkout-form").addEventListener("submit", placeOrder);
});

// Function to fetch and display cart items on the checkout page
function fetchCartForCheckout() {
    const user_id = localStorage.getItem("user_id");

    fetch(`http://localhost:3000/cart/${user_id}`)
        .then(response => response.json())
        .then(data => {
            const orderSummary = document.getElementById("order-summary");
            const totalPriceElement = document.getElementById("total-price");
            orderSummary.innerHTML = "";
            let total = 0;

            if (data.length === 0) {
                orderSummary.innerHTML = "<li class='list-group-item text-center'>Your cart is empty.</li>";
                totalPriceElement.textContent = "GH₵ 0.00";
                return;
            }

            data.forEach(item => {
                let itemTotal = item.price * item.quantity;
                total += itemTotal;

                let listItem = document.createElement("li");
                listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
                listItem.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <strong>GH₵ ${itemTotal.toFixed(2)}</strong>
                `;
                orderSummary.appendChild(listItem);
            });

            totalPriceElement.textContent = `GH₵ ${total.toFixed(2)}`;
        })
        .catch(error => console.error("Error fetching cart:", error));
}

// Function to place an order
function placeOrder(event) {
    event.preventDefault(); // Prevent page reload

    const user_id = localStorage.getItem("user_id");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.querySelector("input[name='payment']:checked").id;
    const totalAmount = document.getElementById("total-price").textContent.replace("GH₵", "").trim();

    fetch("http://localhost:3000/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, name, email, phone, address, paymentMethod, totalAmount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Order placed successfully!");
            localStorage.removeItem("cart"); // Clear cart in localStorage
            window.location.href = "thank-you.html"; // Redirect to Thank You page
        } else {
            alert("Error placing order: " + data.error);
        }
    })
    .catch(error => console.error("Error placing order:", error));
}

// Function to check if user is logged in
function checkLogin() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("You must be logged in to proceed to checkout.");
        window.location.href = "login.html";
    }
}
