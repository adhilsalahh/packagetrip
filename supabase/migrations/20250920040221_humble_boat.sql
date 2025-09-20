/*
  # Seed Sample Data for Kerala Trekking

  1. Sample trek packages with itineraries
  2. Sample admin user (for testing)
  3. Sample reviews and ratings
*/

-- Insert sample trek packages
INSERT INTO trek_packages (
  id,
  title,
  description,
  location,
  duration,
  difficulty,
  price,
  max_group_size,
  images,
  included,
  excluded,
  rating,
  total_reviews
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Munnar Tea Garden Trek',
  'Experience the breathtaking beauty of Munnar''s rolling tea plantations and misty mountains. This moderate trek takes you through emerald green tea gardens, spice plantations, and offers stunning views of the Western Ghats.',
  'Munnar',
  3,
  'Moderate',
  8500.00,
  15,
  ARRAY[
    'https://images.pexels.com/photos/4254563/pexels-photo-4254563.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6794458/pexels-photo-6794458.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4254557/pexels-photo-4254557.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Professional trekking guide',
    '2 nights accommodation',
    'All meals during trek',
    'Transportation',
    'First aid kit',
    'Permits and entry fees'
  ],
  ARRAY[
    'Personal expenses',
    'Travel insurance',
    'Tips and gratuities',
    'Laundry services'
  ],
  4.8,
  124
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Wayanad Wildlife Sanctuary Trek',
  'Explore the pristine forests of Wayanad Wildlife Sanctuary, home to elephants, tigers, and diverse flora. This challenging trek offers wildlife sightings and spectacular views of the Western Ghats.',
  'Wayanad',
  4,
  'Difficult',
  12000.00,
  12,
  ARRAY[
    'https://images.pexels.com/photos/1906794/pexels-photo-1906794.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Expert naturalist guide',
    '3 nights accommodation (2 hotel + 1 camp)',
    'All meals',
    'Transportation',
    'Camping equipment',
    'Wildlife permits'
  ],
  ARRAY[
    'Personal trekking gear',
    'Travel insurance',
    'Personal expenses',
    'Camera fees'
  ],
  4.9,
  89
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Thekkady Spice Trail Adventure',
  'Discover the aromatic spice gardens of Thekkady while trekking through cardamom hills and pepper vines. Perfect for beginners with beautiful landscapes and cultural experiences.',
  'Thekkady',
  2,
  'Easy',
  6000.00,
  20,
  ARRAY[
    'https://images.pexels.com/photos/4220967/pexels-photo-4220967.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Local guide',
    '1 night accommodation',
    'All meals',
    'Boat safari',
    'Spice garden tour',
    'Cultural activities'
  ],
  ARRAY[
    'Personal expenses',
    'Shopping',
    'Additional activities'
  ],
  4.6,
  156
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Idukki Dam Valley Expedition',
  'Experience the engineering marvel of Idukki Dam while trekking through pristine valleys and dense forests. This expert-level trek offers challenging terrain and rewarding views.',
  'Idukki',
  5,
  'Expert',
  15000.00,
  10,
  ARRAY[
    'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1906794/pexels-photo-1906794.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Expert mountaineering guide',
    'All camping equipment',
    'Safety gear and ropes',
    'All meals',
    'Emergency evacuation insurance',
    'Professional photography'
  ],
  ARRAY[
    'Personal mountaineering gear',
    'Travel to base camp',
    'Personal insurance',
    'Medical expenses'
  ],
  4.7,
  43
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Athirappilly Rainforest Trek',
  'Discover the majestic Athirappilly Falls, known as the "Niagara of India", while trekking through lush rainforests and experiencing Kerala''s biodiversity.',
  'Thrissur',
  3,
  'Moderate',
  9500.00,
  16,
  ARRAY[
    'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Certified eco-guide',
    '2 nights eco-lodge stay',
    'All organic meals',
    'Transportation',
    'Forest permits',
    'Photography assistance'
  ],
  ARRAY[
    'Personal expenses',
    'Professional camera rent',
    'Additional excursions'
  ],
  4.5,
  98
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Nelliampathy Hills Weekend Getaway',
  'Perfect weekend escape to the serene Nelliampathy Hills with orange groves, coffee plantations, and panoramic valley views. Ideal for families and beginners.',
  'Palakkad',
  2,
  'Easy',
  5500.00,
  25,
  ARRAY[
    'https://images.pexels.com/photos/4254563/pexels-photo-4254563.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4254557/pexels-photo-4254557.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY[
    'Local guide',
    '1 night hill resort stay',
    'All meals',
    'Plantation tours',
    'Transportation',
    'Fresh fruit sampling'
  ],
  ARRAY[
    'Personal shopping',
    'Extra meals',
    'Personal expenses'
  ],
  4.4,
  187
);

-- Insert itinerary days for Munnar package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'Arrival and Tea Museum Visit', 'Arrive in Munnar, check into accommodation, visit tea museum and factory', ARRAY['Hotel check-in', 'Tea museum tour', 'Evening leisure walk']),
('550e8400-e29b-41d4-a716-446655440001', 2, 'Anamudi Peak Trek', 'Early morning trek to South India''s highest peak', ARRAY['Early morning departure', 'Guided trek to Anamudi', 'Lunch at base camp', 'Return to hotel']),
('550e8400-e29b-41d4-a716-446655440001', 3, 'Echo Point and Departure', 'Visit scenic spots and departure', ARRAY['Echo Point visit', 'Local market shopping', 'Departure']);

-- Insert itinerary days for Wayanad package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440002', 1, 'Arrival and Orientation', 'Arrival, briefing, and acclimatization', ARRAY['Hotel check-in', 'Safety briefing', 'Equipment check', 'Evening nature walk']),
('550e8400-e29b-41d4-a716-446655440002', 2, 'Sanctuary Core Area Trek', 'Deep forest trekking with wildlife spotting', ARRAY['Early morning departure', 'Core area trekking', 'Wildlife photography', 'Camp setup']),
('550e8400-e29b-41d4-a716-446655440002', 3, 'Chembra Peak Ascent', 'Trek to Wayanad''s highest peak', ARRAY['Pre-dawn start', 'Chembra peak trek', 'Heart-shaped lake visit', 'Summit celebration']),
('550e8400-e29b-41d4-a716-446655440002', 4, 'Soochipara Falls and Departure', 'Waterfall visit and departure', ARRAY['Waterfall trek', 'Swimming', 'Local lunch', 'Departure']);

-- Insert itinerary days for Thekkady package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440003', 1, 'Spice Plantation Trek', 'Explore aromatic spice gardens and plantations', ARRAY['Spice garden tour', 'Traditional lunch', 'Bamboo rafting', 'Cultural program']),
('550e8400-e29b-41d4-a716-446655440003', 2, 'Periyar Lake and Wildlife', 'Boat safari and nature walk', ARRAY['Periyar Lake boat ride', 'Wildlife spotting', 'Nature walk', 'Departure']);

-- Insert itinerary days for Idukki package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440004', 1, 'Base Camp Setup', 'Arrival and preparation for challenging trek', ARRAY['Equipment check', 'Fitness assessment', 'Base camp setup', 'Route briefing']),
('550e8400-e29b-41d4-a716-446655440004', 2, 'Valley Descent', 'Challenging descent into Idukki valley', ARRAY['Early start', 'Technical descent', 'River crossing', 'Camp in valley']),
('550e8400-e29b-41d4-a716-446655440004', 3, 'Dam Exploration', 'Explore the dam area and surrounding wilderness', ARRAY['Dam viewpoint trek', 'Photography session', 'Wild camping', 'Night sky observation']),
('550e8400-e29b-41d4-a716-446655440004', 4, 'Ridge Walk', 'Challenging ridge walk with panoramic views', ARRAY['Ridge trail navigation', 'Peak bagging', 'Survival skills', 'Camp under stars']),
('550e8400-e29b-41d4-a716-446655440004', 5, 'Summit and Return', 'Final ascent and return journey', ARRAY['Summit attempt', 'Victory celebration', 'Descent to base', 'Departure']);

-- Insert itinerary days for Athirappilly package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440005', 1, 'Rainforest Introduction', 'Introduction to rainforest ecosystem', ARRAY['Forest guide meeting', 'Eco-education session', 'Short nature walk', 'Bird watching']),
('550e8400-e29b-41d4-a716-446655440005', 2, 'Athirappilly Falls Trek', 'Full day trek to the magnificent waterfalls', ARRAY['Early morning trek', 'Waterfall photography', 'Natural pool swimming', 'Packed lunch by falls']),
('550e8400-e29b-41d4-a716-446655440005', 3, 'Vazhachal Falls and Departure', 'Visit nearby falls and explore local culture', ARRAY['Vazhachal falls visit', 'Local tribal village', 'Cultural exchange', 'Departure']);

-- Insert itinerary days for Nelliampathy package
INSERT INTO itinerary_days (package_id, day_number, title, description, activities) VALUES
('550e8400-e29b-41d4-a716-446655440006', 1, 'Orange Grove Exploration', 'Easy walk through fragrant orange groves', ARRAY['Orange plantation tour', 'Fresh fruit tasting', 'Plantation lunch', 'Evening relaxation']),
('550e8400-e29b-41d4-a716-446655440006', 2, 'Sunrise Point and Coffee Estates', 'Early morning sunrise viewing and coffee plantation visit', ARRAY['Sunrise point trek', 'Coffee plantation tour', 'Local breakfast', 'Departure']);