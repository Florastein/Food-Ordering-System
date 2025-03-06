/*document.addEventListener("DOMContentLoaded", () => {
    const foodList = document.getElementById("food-list");
    const orderList = document.getElementById("order-list");
    const foodForm = document.getElementById("food-form");

    let foodItems = [
        { name: "Burger", price: 5.99 },
        { name: "Pizza", price: 8.99 }
    ];

    let orders = [
        { id: 101, customer: "John Doe", total: "GH₵ 15.99", status: "Pending" },
        { id: 102, customer: "Jane Smith", total: "GH₵ 9.99", status: "Delivered" }
    ];

    function updateFoodList() {
        foodList.innerHTML = "";
        foodItems.forEach((food, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${food.name}</td>
                <td>GH₵ ${food.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-food" data-index="${index}">Delete</button>
                </td>
            `;
            foodList.appendChild(row);
        });
    }

    function updateOrderList() {
        orderList.innerHTML = "";
        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.total}</td>
                <td>${order.status}</td>
                <td>
                    <button class="btn btn-sm btn-success update-status" data-id="${order.id}">Update Status</button>
                </td>
            `;
            orderList.appendChild(row);
        });
    }

    foodForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("food-name").value;
        const price = parseFloat(document.getElementById("food-price").value);
        foodItems.push({ name, price });
        updateFoodList();
        document.getElementById("food-name").value = "";
        document.getElementById("food-price").value = "";
        alert("Food item added successfully!");
    });

    foodList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-food")) {
            const index = e.target.getAttribute("data-index");
            foodItems.splice(index, 1);
            updateFoodList();
        }
    });

    updateFoodList();
    updateOrderList();
});
*/


document.addEventListener("DOMContentLoaded", () => {
    const foodList = document.getElementById("food-list");
    const foodForm = document.getElementById("food-form");

    function fetchFoodItems() {
        fetch("http://localhost:3000/foods")
            .then((response) => response.json())
            .then((data) => {
                foodList.innerHTML = "";
                data.forEach((food) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><img src="http://localhost:3000${food.image}" alt="${food.name}" width="50"></td>
                        <td>${food.name}</td>
                        <td>GH₵ ${food.price.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-food" data-id="${food.id}">Delete</button>
                        </td>
                    `;
                    foodList.appendChild(row);
                });
            })
            .catch((error) => console.error("Error fetching food items:", error));
    }

    foodForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", document.getElementById("food-name").value);
        formData.append("price", parseFloat(document.getElementById("food-price").value));
        formData.append("image", document.getElementById("food-image").files[0]);

        fetch("http://localhost:3000/add-food", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then(() => {
                fetchFoodItems();
                foodForm.reset();
                alert("Food item added successfully!");
            })
            .catch((error) => console.error("Error adding food item:", error));
    });

    foodList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-food")) {
            const id = e.target.getAttribute("data-id");
            fetch(`http://localhost:3000/delete-food/${id}`, { method: "DELETE" })
                .then(() => fetchFoodItems())
                .catch((error) => console.error("Error deleting food item:", error));
        }
    });

    fetchFoodItems();
});
