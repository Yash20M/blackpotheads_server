const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export const sendTelegramNotification = async (message) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
        console.log('Telegram not configured — skipping notification');
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });
        const data = await res.json();
        if (!data.ok) console.error('Telegram error:', data.description);
    } catch (err) {
        console.error('Telegram notification failed:', err.message);
    }
};

// Format order notification message
export const formatOrderMessage = (order, customerInfo = null) => {
    const date = new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata'
    });

    // Customer info
    const name = customerInfo?.name || order.guestInfo?.name || 'Logged-in User';
    const phone = customerInfo?.phone || order.guestInfo?.phone || 'N/A';
    const email = customerInfo?.email || order.guestInfo?.email || 'N/A';

    // Items list
    const itemsList = order.items.map(item => {
        const productName = item.product?.name || item.productName || 'Product';
        return `  • ${productName} × ${item.quantity} (Size: ${item.size}) — ₹${item.price * item.quantity}`;
    }).join('\n');

    // Payment method
    const payment = order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment';

    // Address
    const addr = order.address;
    const address = addr ? `${addr.city}, ${addr.state} - ${addr.pincode}` : 'N/A';

    return `🛍️ <b>NEW ORDER — ${order.orderNumber || order._id.toString().slice(-8)}</b>

👤 <b>${name}</b>
📱 ${phone}
📧 ${email}

📦 <b>Items:</b>
${itemsList}

💰 <b>Total: ₹${order.totalAmount}</b>
${payment}
📍 ${address}

🕐 ${date}`;
};
