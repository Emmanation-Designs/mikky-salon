-- Migration: 20261016000001_initial_mikkys_salon.sql
-- Mikkys Barbing Salon Database Schema and Security Rules

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Customers & Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. BUSINESS SETTINGS TABLE (Configurable salon details)
CREATE TABLE IF NOT EXISTS public.business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    salon_name TEXT NOT NULL DEFAULT 'Mikkys Barbing Salon',
    salon_phone TEXT NOT NULL DEFAULT '+2349038418469',
    admin_email TEXT NOT NULL DEFAULT 'modestanwaije1@gmail.com',
    description TEXT NOT NULL DEFAULT 'Master barbering, precision fades, and bespoke beard grooming. Step into a world of sharp craft.',
    address TEXT DEFAULT '',
    opening_hours TEXT DEFAULT 'Monday – Saturday: 9:00 AM – 8:00 PM · Sunday: 1:00 PM – 7:00 PM',
    currency_symbol TEXT NOT NULL DEFAULT '₦',
    currency_code TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Insert initial business settings if not exists
INSERT INTO public.business_settings (id, salon_name, salon_phone, admin_email, description, address, opening_hours, currency_symbol, currency_code)
VALUES ('default', 'Mikkys Barbing Salon', '+2349038418469', 'modestanwaije1@gmail.com', 'Master barbering, precision fades, and bespoke beard grooming. Step into a world of sharp craft.', '', 'Monday – Saturday: 9:00 AM – 8:00 PM · Sunday: 1:00 PM – 7:00 PM', '₦', 'NGN')
ON CONFLICT (id) DO NOTHING;

-- 4. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- 5. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    promo_price NUMERIC(10,2) CHECK (promo_price >= 0),
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 6. HAIRSTYLES GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.hairstyles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    price_hint NUMERIC(10,2),
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.hairstyles ENABLE ROW LEVEL SECURITY;

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL, -- Normalized international WhatsApp number digits only (e.g., 2349038418469)
    customer_notes TEXT,
    preferred_date DATE,
    preferred_time TEXT,
    confirmed_date DATE,
    confirmed_time TEXT,
    hairstyle_id UUID REFERENCES public.hairstyles(id) ON DELETE SET NULL,
    hairstyle_name TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. ORDER ITEMS TABLE (Snapshot of services at order time)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 9. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    note TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 10. HELPER FUNCTION: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) OR (
        auth.jwt() ->> 'email' = 'modestanwaije1@gmail.com'
    );
$$;

-- 11. TRIGGER: Handle New User Signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT := 'customer';
BEGIN
    -- Authoritative initial admin check by administrator email
    IF NEW.email = 'modestanwaije1@gmail.com' THEN
        v_role := 'admin';
    ELSE
        v_role := 'customer';
    END IF;

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = CASE WHEN NEW.email = 'modestanwaije1@gmail.com' THEN 'admin' ELSE public.profiles.role END,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. ROW LEVEL SECURITY POLICIES

-- Profiles
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile (not role)"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
        OR public.is_admin()
    );

-- Business Settings
CREATE POLICY "Public read business settings"
    ON public.business_settings FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin update business settings"
    ON public.business_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Service Categories
CREATE POLICY "Public read active categories"
    ON public.service_categories FOR SELECT
    TO public
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage categories"
    ON public.service_categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Services
CREATE POLICY "Public read active services"
    ON public.services FOR SELECT
    TO public
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage services"
    ON public.services FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Hairstyles
CREATE POLICY "Public read published hairstyles"
    ON public.hairstyles FOR SELECT
    TO public
    USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage hairstyles"
    ON public.hairstyles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Orders
CREATE POLICY "Customers view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Order Items
CREATE POLICY "Customers view own order items"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Order Status History
CREATE POLICY "Customers view own order history"
    ON public.order_status_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_status_history.order_id
            AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admin insert order status history"
    ON public.order_status_history FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 13. SECURE TRANSACTIONAL FUNCTION: CREATE CUSTOMER ORDER
-- Calculates authoritative prices from services table, ensures atomic creation
CREATE OR REPLACE FUNCTION public.create_customer_order(
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_customer_notes TEXT DEFAULT NULL,
    p_preferred_date DATE DEFAULT NULL,
    p_preferred_time TEXT DEFAULT NULL,
    p_hairstyle_id UUID DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_order_ref TEXT;
    v_total_amount NUMERIC(10,2) := 0;
    v_item JSONB;
    v_service RECORD;
    v_quantity INTEGER;
    v_unit_price NUMERIC(10,2);
    v_item_total NUMERIC(10,2);
    v_hairstyle_name TEXT := NULL;
    v_random_chars TEXT;
BEGIN
    v_user_id := auth.uid();
    
    -- Validate required contact fields
    IF trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Customer full name is required';
    END IF;
    IF trim(p_customer_phone) = '' THEN
        RAISE EXCEPTION 'Customer WhatsApp phone number is required';
    END IF;
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one service';
    END IF;

    -- Lookup hairstyle name if selected
    IF p_hairstyle_id IS NOT NULL THEN
        SELECT name INTO v_hairstyle_name
        FROM public.hairstyles
        WHERE id = p_hairstyle_id;
    END IF;

    -- Generate a collision-resistant, human-readable order reference: MIK-YYYYMMDD-XXXX
    v_random_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
    v_order_ref := 'MIK-' || to_char(now(), 'YYYYMMDD') || '-' || v_random_chars;

    -- Compute trusted total from database services
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_quantity := COALESCE((v_item->>'quantity')::integer, 1);
        IF v_quantity < 1 THEN
            v_quantity := 1;
        END IF;

        SELECT id, name, price, promo_price, is_active INTO v_service
        FROM public.services
        WHERE id = (v_item->>'service_id')::uuid;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Service not found: %', (v_item->>'service_id');
        END IF;

        IF NOT v_service.is_active THEN
            RAISE EXCEPTION 'Service "%" is currently not available', v_service.name;
        END IF;

        -- Use promo price if valid and active, else standard price
        IF v_service.promo_price IS NOT NULL AND v_service.promo_price > 0 THEN
            v_unit_price := v_service.promo_price;
        ELSE
            v_unit_price := v_service.price;
        END IF;

        v_item_total := v_unit_price * v_quantity;
        v_total_amount := v_total_amount + v_item_total;
    END LOOP;

    -- Insert Order record
    INSERT INTO public.orders (
        order_reference,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        preferred_date,
        preferred_time,
        hairstyle_id,
        hairstyle_name,
        total_amount,
        status
    ) VALUES (
        v_order_ref,
        v_user_id,
        trim(p_customer_name),
        trim(p_customer_email),
        trim(p_customer_phone),
        p_customer_notes,
        p_preferred_date,
        p_preferred_time,
        p_hairstyle_id,
        v_hairstyle_name,
        v_total_amount,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- Insert snapshot line items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_quantity := COALESCE((v_item->>'quantity')::integer, 1);
        IF v_quantity < 1 THEN
            v_quantity := 1;
        END IF;

        SELECT id, name, price, promo_price INTO v_service
        FROM public.services
        WHERE id = (v_item->>'service_id')::uuid;

        IF v_service.promo_price IS NOT NULL AND v_service.promo_price > 0 THEN
            v_unit_price := v_service.promo_price;
        ELSE
            v_unit_price := v_service.price;
        END IF;

        v_item_total := v_unit_price * v_quantity;

        INSERT INTO public.order_items (
            order_id,
            service_id,
            service_name,
            unit_price,
            quantity,
            total_price
        ) VALUES (
            v_order_id,
            v_service.id,
            v_service.name,
            v_unit_price,
            v_quantity,
            v_item_total
        );
    END LOOP;

    -- Insert initial status history
    INSERT INTO public.order_status_history (
        order_id,
        previous_status,
        new_status,
        note,
        changed_by
    ) VALUES (
        v_order_id,
        NULL,
        'pending',
        'Order submitted by customer. Awaiting salon review.',
        v_user_id
    );

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_reference', v_order_ref,
        'total_amount', v_total_amount,
        'status', 'pending'
    );
END;
$$;

-- Grant execution to authenticated users and anon users
GRANT EXECUTE ON FUNCTION public.create_customer_order TO authenticated, anon;

-- 14. STORAGE SETUP (salon-media bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-media', 'salon-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read salon media"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'salon-media');

CREATE POLICY "Admin upload salon media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'salon-media' AND public.is_admin());

CREATE POLICY "Admin update salon media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'salon-media' AND public.is_admin());

CREATE POLICY "Admin delete salon media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'salon-media' AND public.is_admin());
