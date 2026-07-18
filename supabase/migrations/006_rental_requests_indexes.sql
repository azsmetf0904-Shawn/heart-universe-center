-- Support common lookup patterns: my-booking (phone/email), LIFF payment
-- lookups (line_user_id), admin calendar (booking_date range), cron reminder
-- / expiry (status + booking_date / payment_due_at).
create index if not exists rental_requests_phone_idx on rental_requests (phone);
create index if not exists rental_requests_email_idx on rental_requests (lower(email));
create index if not exists rental_requests_line_user_id_idx on rental_requests (line_user_id) where line_user_id is not null;
create index if not exists rental_requests_booking_date_idx on rental_requests (booking_date);
create index if not exists rental_requests_status_idx on rental_requests (status);
