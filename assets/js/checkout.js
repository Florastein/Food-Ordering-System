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
