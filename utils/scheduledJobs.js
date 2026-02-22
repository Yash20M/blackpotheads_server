import cron from 'node-cron';
import Order from '../models/order.js';
import Payment from '../models/Payment.js';

/**
 * Auto-cancel abandoned orders
 * Runs every hour to check for orders pending for more than 30 minutes
 */
export const startScheduledJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running scheduled job: Cleaning up abandoned orders...');
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Find pending orders older than 30 minutes
      const abandonedOrders = await Order.find({
        status: "Pending",
        paymentMethod: "Online",
        createdAt: { $lt: thirtyMinutesAgo }
      });

      let cleanedCount = 0;

      for (const order of abandonedOrders) {
        // Check if payment is still in created status
        const payment = await Payment.findOne({ orderId: order._id });
        
        if (payment && payment.status === "created") {
          // Mark order as cancelled
          order.status = "Cancelled";
          await order.save();

          // Mark payment as failed
          payment.status = "failed";
          await payment.save();

          cleanedCount++;
          console.log(`❌ Cancelled abandoned order: ${order._id}`);
        }
      }

      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} abandoned orders`);
      } else {
        console.log('✅ No abandoned orders found');
      }
    } catch (error) {
      console.error('❌ Error in scheduled job:', error);
    }
  });

  console.log('✅ Scheduled jobs started: Auto-cleanup runs every hour');
};
