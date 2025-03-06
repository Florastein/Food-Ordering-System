document.addEventListener("DOMContentLoaded", () => {
    const orderSummary = document.getElementById("order-summary");

    const order = [
        { name: "Classic Burger", price: 5.99, quantity: 2 },
        { name: "Fresh Juice", price: 2.99, quantity: 1 }
    ];

    order.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `${item.quantity} x ${item.name} <span>$${(item.price * item.quantity).toFixed(2)}</span>`;
        orderSummary.appendChild(li);
    });
});
