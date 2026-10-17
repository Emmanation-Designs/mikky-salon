-- Migration: 20261016000002_seed_initial_services.sql
-- Seed default categories, initial barbering services and initial hairstyle gallery items

DO $$
DECLARE
    cat_haircuts UUID;
    cat_beard UUID;
    cat_combo UUID;
    cat_colour UUID;
    cat_washing UUID;
    cat_custom UUID;
    cat_other UUID;
    srv_classic_cut UUID;
    srv_taper_fade UUID;
    srv_beard_sculpt UUID;
    srv_combo_signature UUID;
    srv_wash_treatment UUID;
BEGIN
    -- 1. Insert default categories
    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Haircuts', 'haircuts', 'Precision cuts tailored to your facial structure and personal style.', 1, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 1
    RETURNING id INTO cat_haircuts;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Beard grooming', 'beard-grooming', 'Beard shaping, razor line-ups, and hot towel treatments.', 2, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 2
    RETURNING id INTO cat_beard;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Haircut and beard combo', 'haircut-beard-combo', 'The complete luxury package for hair and beard.', 3, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 3
    RETURNING id INTO cat_combo;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Hair colouring', 'hair-colouring', 'Professional tinting, bleaching, and black dye enhancement.', 4, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 4
    RETURNING id INTO cat_colour;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Hair washing', 'hair-washing', 'Deep scalp cleansing, shampoo wash, and revitalizing conditioner.', 5, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 5
    RETURNING id INTO cat_washing;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Custom styles', 'custom-styles', 'Bespoke artistic hair designs, dread twist styling, and waves.', 6, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 6
    RETURNING id INTO cat_custom;

    INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
    VALUES 
        ('Other services', 'other-services', 'Facial scrub, scalp massage, and specialized treatments.', 7, true)
    ON CONFLICT (name) DO UPDATE SET display_order = 7
    RETURNING id INTO cat_other;

    -- 2. Insert standard services
    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_haircuts, 'Signature Taper / Fade Cut', 'Razor-sharp fade or low taper cut with clean perimeter outline and scissor-finished crown.', 4000.00, NULL, 40, true, true, 1)
    RETURNING id INTO srv_taper_fade;

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_haircuts, 'Classic Gentleman Cut', 'Traditional neat scissor cut or buzz trim finished with a crisp hairline razor touch.', 3000.00, NULL, 30, true, false, 2)
    RETURNING id INTO srv_classic_cut;

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_beard, 'Sculpted Beard Trim & Razor Line-Up', 'Precision beard shaping, edge detailing with straight razor, and nourishing beard oil finish.', 2500.00, NULL, 25, true, true, 3)
    RETURNING id INTO srv_beard_sculpt;

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_combo, 'Executive Haircut + Beard Combo', 'Complete haircut of your choice, sculpted beard trim, straight razor contouring, and hot towel finish.', 6000.00, 5500.00, 55, true, true, 4)
    RETURNING id INTO srv_combo_signature;

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_washing, 'Deep Cleanse Hair Wash & Conditioning', 'Invigorating scalp wash, premium conditioner, and hot blower styling.', 2000.00, NULL, 20, true, false, 5)
    RETURNING id INTO srv_wash_treatment;

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_colour, 'Black Dye Hair & Beard Enhancement', 'Rich natural black dye application for beard and hairline, giving a sharp youthful contrast.', 3500.00, NULL, 30, true, false, 6);

    INSERT INTO public.services (category_id, name, description, price, promo_price, duration_minutes, is_active, is_featured, display_order)
    VALUES 
        (cat_custom, 'Custom Razor Hair Design / Parting', 'Detailed artistic razor art, geometric parts, or freehand line designs.', 2000.00, NULL, 20, true, false, 7);

    -- 3. Insert initial hairstyle gallery items
    INSERT INTO public.hairstyles (name, description, image_url, service_id, price_hint, is_published, display_order)
    VALUES 
        ('360 Waves with Sharp Mid-Fade & Line-Up', 'Deep concentric waves with a razor-sharp geometric hairline edge-up and blended mid-skin fade.', '/src/assets/images/mikkys_signature_fade_1792242196486.jpg', srv_taper_fade, 4500.00, true, 1),
        ('Low Skin Taper with Crisp Line-Up', 'Smooth gradient taper on sides and nape with clean boxed hairline contour.', '/src/assets/images/haircut_fade_classic_1792138006925.jpg', srv_taper_fade, 4000.00, true, 2),
        ('Executive Beard & Clean Edge Profile', 'Full groomed beard with defined cheek line and blended sideburns.', '/src/assets/images/haircut_beard_grooming_1792138006451.jpg', srv_beard_sculpt, 2500.00, true, 3),
        ('Drop Fade with Short Twists Crown', 'Defined natural short twist sponge texture coupled with a deep drop fade.', '/src/assets/images/haircut_twist_fade_1792138007425.jpg', srv_taper_fade, 4000.00, true, 4);
END $$;
