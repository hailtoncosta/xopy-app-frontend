-- Remove the restrictive check constraint on notification type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint including chat types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'payment_received',
  'order_created',
  'payment_approved',
  'payment_rejected',
  'order_cancelled',
  'order_refunded',
  'product_sold',
  'product_purchased',
  'new_message',
  'conversation_started',
  'conversation_closed'
));
