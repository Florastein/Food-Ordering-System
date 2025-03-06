document.addEventListener("DOMContentLoaded", function () {
    checkLogin(); // Ensure user is logged in

    const user_id = localStorage.getItem("user_id");

    fetch(`http://localhost:3000/latest-order/${user_id}`)
        .then(response => response.json())
        .then(data => {
            const orderSummary = document.getElementById("order-summary");
            const totalPriceElement = document.getElementById("total-price");

            orderSummary.innerHTML = "";
            let total = 0;

            if (!data || data.items.length === 0) {
                orderSummary.innerHTML = "<li class='list-group-item text-center'>No recent orders found.</li>";
                totalPriceElement.textContent = "GH₵ 0.00";
                return;
            }

            data.items.forEach(item => {
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
        .catch(error => console.error("Error fetching order details:", error));
});

// Redirect to login if not logged in
function checkLogin() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("You must be logged in to view your order.");
        window.location.href = "login.html";
    }
}
