document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.normal');
    const checkoutButton = document.getElementById('checkout-button');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    // Load cart from local storage on page load
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add event listener to each "Add to Cart" button
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const product = getProductDetails(index);
            addProductToCart(product);
            alert(`${product.name} (${product.size}, ${product.quantity} units) added to cart!`);
        });
    });

    function getProductDetails(index) {
        // Get the product details based on the index
        const productName = document.querySelectorAll('.product-name')[index].textContent;
        const productPrice = parseFloat(document.querySelectorAll('.product-price')[index].textContent.replace('$', ''));
        const productSize = document.querySelectorAll('.product-size')[index].value;
        const productQuantity = parseInt(document.querySelectorAll('.product-quantity')[index].value);

        return {
            id: index,
            name: productName,
            price: productPrice,
            size: productSize,
            quantity: productQuantity
        };
    }

    function addProductToCart(product) {
        const existingProduct = cart.find(item => item.id === product.id && item.size === product.size);
        if (existingProduct) {
            existingProduct.quantity += product.quantity;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart updated:', cart);
    }

    // Checkout button functionality
    checkoutButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default form submission

        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Prepare order data to send
        const orderData = {
            items: cart
        };

        try {
            const response = await fetch('http://localhost/cara_project/submit_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const responseData = await response.json();
                alert(responseData.message);
                localStorage.removeItem('cart'); // Clear the cart after successful submission
                cart = []; // Reset cart variable
                updateCartUI(); // Refresh cart UI
            } else {
                alert('Error during checkout: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during checkout: Failed to fetch');
        }
    });

    // Load cart from local storage
    updateCartUI();

    function updateCartUI() {
        cartItemsList.innerHTML = '';
        let total = 0;

        cart.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="product-details">${product.name} - $${product.price}</div>
                <div class="product-size">Size: ${product.size}</div>
                <div class="product-quantity">
                    Qty: ${product.quantity}
                    <button class="decrease-quantity" data-index="${cart.indexOf(product)}">-</button>
                    <button class="remove-item" data-index="${cart.indexOf(product)}">Remove</button>
                </div>
            `;
            cartItemsList.appendChild(li);
            total += product.price * product.quantity;
        });

        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        attachEventListeners();
    }

    // Function to decrease quantity of a product
    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            removeProduct(index);
        }
        updateCart();
    }

    // Function to remove a product from the cart
    function removeProduct(index) {
        cart.splice(index, 1);
        updateCart();
    }

    // Function to attach event listeners to decrease quantity and remove buttons
    function attachEventListeners() {
        const decreaseButtons = document.querySelectorAll('.decrease-quantity');
        const removeButtons = document.querySelectorAll('.remove-item');

        decreaseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                decreaseQuantity(index);
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                removeProduct(index);
            });
        });
    }

    // Function to update the cart in local storage and re-render the cart
    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
});

