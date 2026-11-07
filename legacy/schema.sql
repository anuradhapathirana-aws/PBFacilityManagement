-- CleaningOS production-oriented PostgreSQL schema (NOT deployed).
-- Before exposing Supabase tables to clients, implement and test RLS policies.
create extension if not exists pgcrypto;
create table app_users (id uuid primary key references auth.users(id) on delete cascade, full_name text not null, phone text, role text not null check(role in ('admin','customer','cleaner','driver')), created_at timestamptz default now());
create table customers (id uuid primary key default gen_random_uuid(), user_id uuid unique references app_users(id), full_name text not null, phone text not null, created_at timestamptz default now());
create table staff (id uuid primary key default gen_random_uuid(), user_id uuid unique references app_users(id), name text not null, phone text, role text not null check(role in ('cleaner','driver')), active boolean not null default true);
create table bookings (id uuid primary key default gen_random_uuid(), customer_id uuid not null references customers(id), service text not null, area text not null, address text, starts_at timestamptz not null, hours numeric(5,2) not null check(hours>0), cleaner_count integer not null check(cleaner_count>0), hourly_rate_aed numeric(10,2) not null check(hourly_rate_aed>=0), status text not null default 'Pending' check(status in ('Pending','Confirmed','Assigned','On the Way','In Progress','Completed','Cancelled')), payment_status text not null default 'Unpaid' check(payment_status in ('Unpaid','Partial','Paid')), notes text, created_at timestamptz default now());
create table booking_cleaners (booking_id uuid not null references bookings(id) on delete cascade, staff_id uuid not null references staff(id), primary key(booking_id,staff_id));
create table booking_drivers (booking_id uuid primary key references bookings(id) on delete cascade, staff_id uuid not null references staff(id));
create index idx_bookings_starts_at on bookings(starts_at);
create index idx_booking_cleaners_staff on booking_cleaners(staff_id);
-- App/backend must enforce exact cleaner count and prevent overlapping assignments
-- transactionally (server-side), not just in client-side JavaScript.
-- RLS deliberately not enabled here: DO NOT expose these tables via public API
-- until suitable per-role RLS policies have been implemented and reviewed.
