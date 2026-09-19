-- ============================================================================
-- NEXORA Database Seed Data
-- Realistic sample catalog: 8 categories, 32 products, users, reviews, coupons
-- ============================================================================

-- ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'CUSTOMER', 'Standard customer account with shopping and ordering rights'),
(2, 'MANAGER', 'Store manager with inventory, order processing, and analytics rights'),
(3, 'ADMIN', 'Super administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- USERS (Password hashes are bcrypt for: 'Password@123')
-- Hash: $2a$10$XpZ5T//kuInlKKg.aiOrz.JnH.x5wjaISsjygbjc3x2reqImyefUa
INSERT INTO users (id, name, email, password_hash, phone, avatar_url, wallet_address) VALUES
('a0000000-0000-0000-0000-000000000001', 'Admin Nexora', 'admin@nexora.com', '$2a$10$XpZ5T//kuInlKKg.aiOrz.JnH.x5wjaISsjygbjc3x2reqImyefUa', '+91 9876543210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
('a0000000-0000-0000-0000-000000000002', 'Dev Manager', 'manager@nexora.com', '$2a$10$XpZ5T//kuInlKKg.aiOrz.JnH.x5wjaISsjygbjc3x2reqImyefUa', '+91 9876543211', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
('a0000000-0000-0000-0000-000000000003', 'Aarav Sharma', 'customer@nexora.com', '$2a$10$XpZ5T//kuInlKKg.aiOrz.JnH.x5wjaISsjygbjc3x2reqImyefUa', '+91 9876543212', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- USER_ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
('a0000000-0000-0000-0000-000000000001', 3), -- ADMIN
('a0000000-0000-0000-0000-000000000002', 2), -- MANAGER
('a0000000-0000-0000-0000-000000000003', 1)  -- CUSTOMER
ON CONFLICT DO NOTHING;

-- ADDRESSES
INSERT INTO addresses (id, user_id, full_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Aarav Sharma', 'Flat 402, Cyber Heights', 'Outer Ring Road, Marathahalli', 'Bengaluru', 'Karnataka', '560037', 'India', '+91 9876543212', TRUE)
ON CONFLICT DO NOTHING;

-- CATEGORIES (8 Categories)
INSERT INTO categories (id, name, slug, description, image_url, icon) VALUES
('c0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Cutting-edge smartphones, audio gear, wearables, and compute gadgets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'bi-cpu'),
('c0000000-0000-0000-0000-000000000002', 'Fashion', 'fashion', 'Curated designer apparel, premium footwear, and modern everyday essentials', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', 'bi-bag-check'),
('c0000000-0000-0000-0000-000000000003', 'Home & Living', 'home-living', 'Smart home accessories, ergonomic furniture, and artisanal decor', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', 'bi-house-heart'),
('c0000000-0000-0000-0000-000000000004', 'Gaming', 'gaming', 'High-performance consoles, mechanical keyboards, precision mice, and displays', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', 'bi-controller'),
('c0000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Luxury watches, leather wallets, optical frames, and lifestyle gear', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'bi-watch'),
('c0000000-0000-0000-0000-000000000006', 'Books', 'books', 'Bestselling fiction, technology deep-dives, business memoirs, and classics', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80', 'bi-book'),
('c0000000-0000-0000-0000-000000000007', 'Sports & Fitness', 'sports-fitness', 'Pro workout equipment, athletic apparel, hydration, and outdoor essentials', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', 'bi-activity'),
('c0000000-0000-0000-0000-000000000008', 'Beauty & Wellness', 'beauty-wellness', 'Dermatologist-tested skincare, organic scents, and restorative grooming sets', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 'bi-flower1')
ON CONFLICT (slug) DO NOTHING;

-- PRODUCTS (32 Products)
-- Category 1: Electronics
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'AuraSound Sonic Pro ANC Headphones', 'aurasound-sonic-pro-anc-headphones', 'Engineered with custom 40mm beryllium drivers, active hybrid noise cancellation up to 42dB, and 50-hour battery life. Includes multi-point Bluetooth 5.3 and ultra-soft memory foam earcups.', 'Premium active noise-cancelling wireless headphones with 50-hour playback.', 'AuraSound', 'ELEC-HP-001', 14999.00, 18999.00, 4.8, 128, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'PulseFit Horizon Ultra Smartwatch', 'pulsefit-horizon-ultra-smartwatch', '1.96-inch AMOLED display with 1000 nits peak brightness, sapphire crystal lens, dual-frequency GPS, heart-rate variability and blood oxygen monitoring. 14 days endurance.', 'Rugged aerospace-grade titanium smartwatch with full biometric suite.', 'PulseFit', 'ELEC-SW-002', 19999.00, 24999.00, 4.7, 94, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Nexora StreamPod 4K Creator Camera', 'nexora-streampod-4k-creator-camera', 'Ultra-compact 4K 60fps streaming camera featuring AI face-tracking, low-light HDR sensor, and studio stereo microphones with noise-filtering.', 'Studio-grade 4K streaming and podcast camera with smart framing.', 'Nexora Studio', 'ELEC-CAM-003', 12499.00, 15999.00, 4.6, 52, FALSE, TRUE),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'VoltCore 100W GaN Fast Charging Station', 'voltcore-100w-gan-fast-charging-station', '4-port fast GaN III charger with 3x USB-C and 1x USB-A ports. Powers laptops, tablets, and phones simultaneously with dynamic thermal protection.', 'Compact multi-device 100W GaN high-speed desktop charger.', 'VoltCore', 'ELEC-CHG-004', 3499.00, 4999.00, 4.9, 210, FALSE, FALSE);

-- Category 2: Fashion
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Nomad Merino Wool Overshirt', 'nomad-merino-wool-overshirt', 'Crafted from 100% sustainably sourced 280gsm Australian Merino wool. Breathable, thermo-regulating, wrinkle-resistant and naturally odor-repellent.', 'Tailored temperature-regulating Merino wool overshirt for all seasons.', 'Nomad Atelier', 'FASH-SH-001', 6499.00, 7999.00, 4.7, 76, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'AeroStep Minimalist Leather Sneakers', 'aerostep-minimalist-leather-sneakers', 'Full-grain Italian Nappa leather uppers with recycled EVA memory foam insoles and vulcanized rubber outsoles. Clean silhouettes built for all-day walking comfort.', 'Handcrafted low-top Italian leather sneakers in cloud white.', 'AeroStep', 'FASH-SN-002', 8999.00, 11999.00, 4.9, 142, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'UrbanFlex Technical Trench Coat', 'urbanflex-technical-trench-coat', 'DWR waterproof breathable 3-layer laminated fabric. Features storm flap, magnetic collar closure, hidden phone pocket, and reflective trim.', 'Modern stormproof trench coat with concealed magnetic accents.', 'UrbanFlex', 'FASH-JK-003', 11999.00, 14999.00, 4.5, 38, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'Solstice Silk-Cotton Blend Polo', 'solstice-silk-cotton-blend-polo', '70% Pima cotton and 30% Mulberry silk knit with open camp collar. Unmatched softness and drape, ideal for warm evenings and travel.', 'Luxurious open-collar silk-cotton knit polo shirt.', 'Solstice', 'FASH-PL-004', 3299.00, 4299.00, 4.6, 61, FALSE, TRUE);

-- Category 3: Home & Living
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'Lumina Nordic Arc Floor Lamp', 'lumina-nordic-arc-floor-lamp', 'Minimalist architectural floor lamp with touch-dimmable warm-to-cool LED temperature control. Solid marble base and matte black aluminum arch.', 'Contemporary arched floor lamp with heavy Italian marble base.', 'Lumina Living', 'HOME-LP-001', 13499.00, 16999.00, 4.8, 49, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'Aromatica Ultrasonic Ceramic Diffuser', 'aromatica-ultrasonic-ceramic-diffuser', 'Handcrafted matte ceramic cover with WhisperQuiet ultrasonic misting technology, ambient warm glow, and 12-hour continuous runtime.', 'Stone-finish ceramic essential oil aroma diffuser and ambient light.', 'Aromatica', 'HOME-DF-002', 2999.00, 3999.00, 4.7, 115, FALSE, TRUE),
('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 'ErgoRest Dual-Motor Standing Desk', 'ergorest-dual-motor-standing-desk', 'Solid American walnut top with anti-collision dual electric motors, digital memory handset with 4 presets, and integrated cable tray.', 'Electric height-adjustable standing desk in solid American walnut.', 'ErgoRest', 'HOME-DK-003', 28999.00, 34999.00, 4.9, 83, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'BaristaCraft Precision Pour-Over Kettle', 'baristacraft-precision-pour-over-kettle', 'Gooseneck spout for surgical pour accuracy, digital 1-degree temperature control, 60-minute keep-warm mode, and LCD stopwatch.', 'Digital variable-temperature gooseneck electric pour-over kettle.', 'BaristaCraft', 'HOME-KT-004', 5999.00, 7499.00, 4.8, 92, FALSE, FALSE);

-- Category 4: Gaming
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000004', 'Vortex V80 Hall-Effect Mechanical Keyboard', 'vortex-v80-hall-effect-mechanical-keyboard', 'Magnetic Hall-Effect analog switches with 0.1mm adjustable actuation, rapid trigger technology, CNC aluminum chassis, and per-key RGB.', 'Ultra-responsive rapid-trigger magnetic gaming keyboard.', 'Vortex Gear', 'GAME-KB-001', 15999.00, 19999.00, 4.9, 167, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000004', 'Hyperion Ultralight Carbon Wireless Mouse', 'hyperion-ultralight-carbon-wireless-mouse', 'Weighing only 38 grams with woven carbon fiber shell, 32K DPI optical sensor, 8000Hz polling rate, and pure PTFE glide feet.', 'Featherweight 38g carbon fiber 8K polling wireless mouse.', 'Hyperion Gaming', 'GAME-MS-002', 8499.00, 10999.00, 4.8, 88, FALSE, TRUE),
('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000004', 'TitanView 34-Inch Curved QD-OLED Monitor', 'titanview-34-inch-curved-qd-oled-monitor', '3440x1440 UWQHD, 175Hz refresh rate, 0.03ms response time, 99.3% DCI-P3 gamut, and HDR True Black 400 with factory calibration report.', '34-inch ultrawide QD-OLED 175Hz curved display with true blacks.', 'TitanView', 'GAME-MN-003', 69999.00, 79999.00, 5.0, 41, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000004', 'NovaPro Spatial Audio Wireless Headset', 'novapro-spatial-audio-wireless-headset', 'Simultaneous 2.4GHz lossless wireless and Bluetooth audio, swappable dual-battery infinity power system, active noise cancellation.', 'Esports wireless gaming headset with swappable dual batteries.', 'NovaSound', 'GAME-HS-004', 21999.00, 26999.00, 4.7, 79, FALSE, FALSE);

-- Category 5: Accessories
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000005', 'Chronos Eclipse Automatic Chronograph', 'chronos-eclipse-automatic-chronograph', '316L stainless steel case with double-domed sapphire glass, custom rotor, 28,800 bph Swiss-inspired movement, and water resistance to 100m.', 'Striking automatic mechanical chronograph watch on steel mesh.', 'Chronos', 'ACC-WT-001', 24999.00, 31999.00, 4.9, 58, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000005', 'Apex Bifold MagSafe Leather Wallet', 'apex-bifold-magsafe-leather-wallet', 'Vegetable-tanned Horween leather with embedded MagSafe magnet array and RFID shielding. Holds 8 cards and folded bills in ultra-slim profile.', 'Slim Horween leather wallet with integrated MagSafe attachment.', 'Apex Goods', 'ACC-WL-002', 3299.00, 4299.00, 4.8, 134, FALSE, TRUE),
('d0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000005', 'AuraOptics Polarized Titanium Aviators', 'auraoptics-polarized-titanium-aviators', 'Japanese titanium frame weighing under 16 grams with anti-reflective polarized CR-39 lenses and 100% UVA/UVB protection.', 'Featherlight Japanese titanium frame aviators with polarized tint.', 'AuraOptics', 'ACC-SG-003', 7499.00, 9499.00, 4.7, 65, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000005', 'Voyager 28L Weatherproof Commuter Backpack', 'voyager-28l-weatherproof-commuter-backpack', 'Constructed from Cordura ballistic nylon with YKK AquaGuard zips, dedicated 16-inch padded laptop bay, and luggage pass-through.', 'Rugged waterproof EDC tech pack with ergonomic load-lifters.', 'Voyager Pack', 'ACC-BP-004', 6999.00, 8999.00, 4.8, 103, TRUE, TRUE);

-- Category 6: Books
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000006', 'Architecting Intelligent Systems (Hardcover)', 'architecting-intelligent-systems-hardcover', 'A definitive treatise on scaling distributed systems, LLM agents, vector pipelines, and autonomous AI infrastructure for modern cloud engineers.', 'Comprehensive manual on enterprise AI architecture and patterns.', 'O''Reilly Media', 'BOOK-AI-001', 2899.00, 3499.00, 5.0, 89, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000006', 'Principles of Modern Venture Design', 'principles-of-modern-venture-design', 'Insightful case studies from leading tech founders on product-market fit, capital allocation, engineering culture, and long-term moats.', 'Hardcover edition on building enduring technological enterprises.', 'Harper Business', 'BOOK-BIZ-002', 1299.00, 1699.00, 4.7, 44, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000006', 'The Quantum Computing Handbook', 'the-quantum-computing-handbook', 'Covers qubits, entanglement, quantum gates, Shor algorithm, and programming on real QPU simulators using Qiskit.', 'Rigorous foundation of quantum algorithms and hardware physics.', 'MIT Press', 'BOOK-QC-003', 3499.00, 4199.00, 4.9, 29, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000006', 'Mastering TypeScript & Modern Web Architecture', 'mastering-typescript-modern-web-architecture', 'Deep dive into advanced type-level programming, AST transformations, zero-runtime CSS, and high-concurrency micro-frontends.', 'Advanced handbook for senior full-stack JavaScript & TypeScript devs.', 'Pragmatic Books', 'BOOK-TS-004', 1999.00, 2499.00, 4.8, 112, FALSE, TRUE);

-- Category 7: Sports & Fitness
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000007', 'TitanGrip Adjustable Smart Dumbbell Set', 'titangrip-adjustable-smart-dumbbell-set', 'Adjustable from 2.5kg to 25kg in 1-second twist mechanism. Bluetooth connected sensor tracks reps, tempo, and total tonnage in companion app.', 'All-in-one 25kg selectorized smart dumbbells with digital tracking.', 'TitanGrip', 'SPRT-DB-001', 22999.00, 27999.00, 4.8, 71, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000007', 'HydroVolt Self-Cleaning UV Water Bottle', 'hydrovolt-self-cleaning-uv-water-bottle', 'Medical-grade 18/8 insulated stainless steel with UVC purification cap that eliminates 99.9% of bacteria every 2 hours. Keeps cold for 24h.', 'Insulated 750ml bottle with built-in UV-C water sanitizing cap.', 'HydroVolt', 'SPRT-BT-002', 3999.00, 4999.00, 4.6, 95, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000007', 'ZenFlow Eco-Grip Natural Rubber Yoga Mat', 'zenflow-eco-grip-natural-rubber-yoga-mat', 'Biodegradable natural tree rubber base with moisture-wicking polyurethane top coat. 5mm thickness delivers optimal joint cushioning.', 'Premium non-slip eco rubber mat for intense hot yoga and Pilates.', 'ZenFlow', 'SPRT-YM-003', 4499.00, 5499.00, 4.9, 63, FALSE, TRUE),
('d0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000007', 'AeroSpeed Carbon-Plate Marathon Shoes', 'aerospeed-carbon-plate-marathon-shoes', 'Full-length curved carbon fiber propulsion plate sandwiched between supercritical PEBA foam. Designed for race day personal bests.', 'Elite marathon racing shoes with energy-return carbon plate.', 'AeroSpeed', 'SPRT-SH-004', 16999.00, 20999.00, 4.8, 48, TRUE, FALSE);

-- Category 8: Beauty & Wellness
INSERT INTO products (id, category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, rating, review_count, is_featured, is_trending) VALUES
('d0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000008', 'Botanica Cellular Renewal Night Elixir', 'botanica-cellular-renewal-night-elixir', 'Infused with bakuchiol, bioactive peptides, and cold-pressed squalane. Restores lipid moisture barrier and visibly refines texture overnight.', 'Clean peptide and botanical retinol alternative night serum (30ml).', 'Botanica Lab', 'BEAU-SR-001', 3799.00, 4699.00, 4.9, 137, TRUE, TRUE),
('d0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000008', 'AuraGlow LED Phototherapy Face Mask', 'auraglow-led-phototherapy-face-mask', 'Medical-grade flexible silicone with 132 LEDs delivering red (633nm), near-infrared (830nm), and blue (415nm) wavelength therapy in 10 minutes.', 'Clinical-grade 3-wavelength red & infrared anti-aging LED mask.', 'AuraGlow', 'BEAU-MK-002', 18999.00, 23999.00, 4.7, 54, TRUE, FALSE),
('d0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000008', 'Oasis Deep Hydration Barrier Balm', 'oasis-deep-hydration-barrier-balm', 'Rich restorative ceramide cream packed with centella asiatica, 5 molecular weights of hyaluronic acid, and shea butter for dry or compromised skin.', 'Ceramide restorative barrier cream for dry and sensitive skin.', 'Oasis Skincare', 'BEAU-CR-003', 1899.00, 2399.00, 4.8, 88, FALSE, FALSE),
('d0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000008', 'Maison Noire Artisanal Extrait de Parfum', 'maison-noire-artisanal-extrait-de-parfum', 'Notes of smoked oud, rare saffron, tonka bean, and Madagascan vanilla. Highly concentrated 30% fragrance oil with 14-hour longevity.', 'Luxury unisex extrait de parfum with smoky amber and vanilla notes.', 'Maison Noire', 'BEAU-PF-004', 8999.00, 11499.00, 4.9, 72, FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- PRODUCT_IMAGES (Primary and gallery images for all 32 products)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
('d0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'AuraSound Sonic Pro ANC Headphones Main', TRUE, 1),
('d0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'AuraSound Sonic Pro Folded In Case', FALSE, 2),
('d0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'PulseFit Horizon Ultra Smartwatch Front', TRUE, 1),
('d0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Nexora StreamPod 4K Camera Main', TRUE, 1),
('d0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', 'VoltCore 100W GaN Fast Charger Front', TRUE, 1),
('d0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', 'Nomad Merino Wool Overshirt Model', TRUE, 1),
('d0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 'AeroStep Minimalist Leather Sneakers Profile', TRUE, 1),
('d0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80', 'UrbanFlex Technical Trench Coat Front', TRUE, 1),
('d0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', 'Solstice Silk-Cotton Blend Polo Navy', TRUE, 1),
('d0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', 'Lumina Nordic Arc Floor Lamp Living Room', TRUE, 1),
('d0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', 'Aromatica Ultrasonic Ceramic Diffuser Mist', TRUE, 1),
('d0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80', 'ErgoRest Standing Desk Full View', TRUE, 1),
('d0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', 'BaristaCraft Pour-Over Kettle Brewing', TRUE, 1),
('d0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'Vortex V80 Keyboard Overhead', TRUE, 1),
('d0000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 'Hyperion Ultralight Carbon Mouse Angle', TRUE, 1),
('d0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 'TitanView 34-Inch Curved Monitor Setup', TRUE, 1),
('d0000000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80', 'NovaPro Spatial Audio Headset Stand', TRUE, 1),
('d0000000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', 'Chronos Eclipse Chronograph Dial', TRUE, 1),
('d0000000-0000-0000-0000-000000000018', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', 'Apex Bifold MagSafe Wallet Open', TRUE, 1),
('d0000000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 'AuraOptics Polarized Titanium Aviators Angle', TRUE, 1),
('d0000000-0000-0000-0000-000000000020', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Voyager 28L Weatherproof Backpack Front', TRUE, 1),
('d0000000-0000-0000-0000-000000000021', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'Architecting Intelligent Systems Book Cover', TRUE, 1),
('d0000000-0000-0000-0000-000000000022', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80', 'Principles of Modern Venture Design Cover', TRUE, 1),
('d0000000-0000-0000-0000-000000000023', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&q=80', 'Quantum Computing Handbook Cover', TRUE, 1),
('d0000000-0000-0000-0000-000000000024', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', 'Mastering TypeScript Architecture Book Cover', TRUE, 1),
('d0000000-0000-0000-0000-000000000025', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', 'TitanGrip Adjustable Smart Dumbbell Pair', TRUE, 1),
('d0000000-0000-0000-0000-000000000026', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'HydroVolt Self-Cleaning Water Bottle White', TRUE, 1),
('d0000000-0000-0000-0000-000000000027', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', 'ZenFlow Yoga Mat Rolled Out', TRUE, 1),
('d0000000-0000-0000-0000-000000000028', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'AeroSpeed Carbon-Plate Marathon Shoes Profile', TRUE, 1),
('d0000000-0000-0000-0000-000000000029', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', 'Botanica Cellular Renewal Night Elixir Dropper', TRUE, 1),
('d0000000-0000-0000-0000-000000000030', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', 'AuraGlow LED Face Mask Lit Up', TRUE, 1),
('d0000000-0000-0000-0000-000000000031', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', 'Oasis Deep Hydration Barrier Balm Jar', TRUE, 1),
('d0000000-0000-0000-0000-000000000032', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 'Maison Noire Artisanal Extrait Bottle', TRUE, 1)
ON CONFLICT DO NOTHING;

-- INVENTORY (Stock levels for all 32 products, including low stock items for dashboard testing)
INSERT INTO inventory (product_id, stock, reserved_stock, low_stock_threshold) VALUES
('d0000000-0000-0000-0000-000000000001', 45, 2, 8),
('d0000000-0000-0000-0000-000000000002', 28, 1, 5),
('d0000000-0000-0000-0000-000000000003', 14, 0, 5),
('d0000000-0000-0000-0000-000000000004', 120, 4, 15),
('d0000000-0000-0000-0000-000000000005', 3, 0, 5),  -- Low stock item
('d0000000-0000-0000-0000-000000000006', 50, 3, 10),
('d0000000-0000-0000-0000-000000000007', 22, 1, 5),
('d0000000-0000-0000-0000-000000000008', 65, 2, 10),
('d0000000-0000-0000-0000-000000000009', 12, 1, 4),
('d0000000-0000-0000-0000-000000000010', 85, 5, 12),
('d0000000-0000-0000-0000-000000000011', 18, 2, 4),
('d0000000-0000-0000-0000-000000000012', 40, 2, 8),
('d0000000-0000-0000-0000-000000000013', 2, 0, 5),  -- Low stock item
('d0000000-0000-0000-0000-000000000014', 35, 1, 8),
('d0000000-0000-0000-0000-000000000015', 8, 1, 3),
('d0000000-0000-0000-0000-000000000016', 30, 0, 6),
('d0000000-0000-0000-0000-000000000017', 15, 1, 5),
('d0000000-0000-0000-0000-000000000018', 90, 4, 15),
('d0000000-0000-0000-0000-000000000019', 42, 2, 8),
('d0000000-0000-0000-0000-000000000020', 38, 3, 10),
('d0000000-0000-0000-0000-000000000021', 150, 6, 20),
('d0000000-0000-0000-0000-000000000022', 75, 2, 10),
('d0000000-0000-0000-0000-000000000023', 4, 0, 5),  -- Low stock item
('d0000000-0000-0000-0000-000000000024', 95, 3, 12),
('d0000000-0000-0000-0000-000000000025', 16, 1, 4),
('d0000000-0000-0000-0000-000000000026', 60, 2, 10),
('d0000000-0000-0000-0000-000000000027', 48, 1, 8),
('d0000000-0000-0000-0000-000000000028', 25, 2, 5),
('d0000000-0000-0000-0000-000000000029', 80, 5, 12),
('d0000000-0000-0000-0000-000000000030', 19, 1, 4),
('d0000000-0000-0000-0000-000000000031', 110, 4, 15),
('d0000000-0000-0000-0000-000000000032', 32, 2, 6)
ON CONFLICT (product_id) DO NOTHING;

-- COUPONS
INSERT INTO coupons (id, code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, used_count, is_active, valid_until) VALUES
('e0000000-0000-0000-0000-000000000001', 'NEXORA10', 'PERCENTAGE', 10.00, 1000.00, 1500.00, 500, 34, TRUE, CURRENT_TIMESTAMP + INTERVAL '90 days'),
('e0000000-0000-0000-0000-000000000002', 'WELCOME500', 'FIXED_AMOUNT', 500.00, 2500.00, 500.00, 1000, 120, TRUE, CURRENT_TIMESTAMP + INTERVAL '60 days'),
('e0000000-0000-0000-0000-000000000003', 'SUPERVIP20', 'PERCENTAGE', 20.00, 10000.00, 5000.00, 100, 15, TRUE, CURRENT_TIMESTAMP + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

-- REVIEWS
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 5, 'Unbelievable Soundstage & ANC', 'The active noise cancellation is superior even in busy coffee shops, and the beryllium drivers deliver tight, punchy sub-bass without muddying vocals.', TRUE, TRUE),
('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003', 5, 'Best competitive gaming keyboard hands down', 'The magnetic rapid trigger is instant in tactical shooters. The solid aluminum case feels ultra premium and heavy on the desk.', TRUE, TRUE),
('d0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000003', 5, 'Must read for any senior engineer', 'Crystal clear explanations on distributed vector indices, autonomous agent coordination, and production resilience.', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- SAMPLE COMPLETED ORDER FOR ANALYTICS AND INVOICE TESTING
INSERT INTO orders (id, order_number, user_id, shipping_address, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, coupon_code, payment_method, payment_status, order_status, tracking_number) VALUES
('f0000000-0000-0000-0000-000000000001', 'NEX-2026-98214', 'a0000000-0000-0000-0000-000000000003', '{"full_name":"Aarav Sharma","address_line1":"Flat 402, Cyber Heights","address_line2":"Outer Ring Road, Marathahalli","city":"Bengaluru","state":"Karnataka","postal_code":"560037","country":"India","phone":"+91 9876543212"}', 14999.00, 1499.90, 2429.84, 0.00, 15928.94, 'NEXORA10', 'CREDIT_CARD', 'PAID', 'DELIVERED', 'TRK-IND-884920')
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, total, image_url) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'AuraSound Sonic Pro ANC Headphones', 'ELEC-HP-001', 14999.00, 1, 14999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80')
ON CONFLICT DO NOTHING;

INSERT INTO payments (order_id, payment_method, amount, currency, transaction_id, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'CREDIT_CARD', 15928.94, 'INR', 'PAY_TXN_99182348', 'COMPLETED')
ON CONFLICT DO NOTHING;
