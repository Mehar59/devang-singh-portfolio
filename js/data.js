/* Project + archive content. Image keys map to assets/img/<key>.webp (and <key>-sm.webp). */
window.PROJECTS = {
  living: {
    num: '01', title: 'The Teal <em>Living Room</em>', plain: 'The Teal Living Room',
    meta: [['Type', 'Residential interior'], ['Space', 'Living room'], ['Scope', '3D model & render']],
    desc: 'A calm, gallery-like living room anchored by a book-matched marble feature wall, twin interlocking round mirrors and a deep teal sectional. A back-lit grid ceiling of soft-edged panels washes the room in even light, while fluted white battens and walnut veneer frame the TV wall.',
    highlights: ['Marble feature wall with interlocking mirrors', 'Back-lit grid false ceiling', 'Fluted battens + walnut veneer TV wall', 'Brass-and-glass wall sconces'],
    images: ['living-teal-sofa', 'living-teal-lowangle', 'living-tv-staircase', 'living-tv-wall', 'ceiling-led-grid']
  },
  stair: {
    num: '02', title: 'Floating Stair <em>&amp; Foyer</em>', plain: 'Floating Stair & Foyer',
    meta: [['Type', 'Residential interior'], ['Space', 'Stairwell · foyer'], ['Scope', '3D model & render']],
    desc: 'A double-height stairwell treated as the home’s sculpture: cantilevered treads with under-step LED, a frameless glass balustrade and tall arched leaf-motif panels with integrated linear lights. Beneath the flight, walnut storage with display niches folds into a back-lit wash counter; across the room, capsule mirrors float on a burgundy lacquer wall.',
    highlights: ['Arched leaf-motif panels, 2-storey', 'Under-tread LED + glass balustrade', 'Walnut under-stair storage with niches', 'Capsule mirrors on burgundy lacquer'],
    images: ['stair-leaf-panels', 'stair-wash-wide', 'stair-wash-front', 'living-oval-mirrors']
  },
  dining: {
    num: '03', title: 'Dining &amp; <em>Family Lounge</em>', plain: 'Dining & Family Lounge',
    meta: [['Type', 'Residential interior'], ['Space', 'Dining · lounge'], ['Scope', '3D model & render']],
    desc: 'An open dining and family zone composed in layers — textured plaster, walnut slats, a sculpted white arch around the TV with lit niches, and full-height marble slabs separated by fine black reveals. A floating wash counter with a halo mirror keeps dining practical, while jaali-cut doors bring pattern and light.',
    highlights: ['Six-seater dining in grey upholstery', 'Sculpted arch TV wall with lit niches', 'Marble slabs with black reveals', 'Jaali-cut double doors'],
    images: ['dining-vanity', 'dining-tv-arch', 'lounge-arch-tv']
  },
  bedroom: {
    num: '04', title: 'Bedrooms <em>&amp; Lounge</em>', plain: 'Bedrooms & Lounge',
    meta: [['Type', 'Residential interior'], ['Space', 'Bedrooms · TV lounge'], ['Scope', '3D model & render']],
    desc: 'Hotel-calm private rooms: a fluted headboard wall flanked by moulded panels and halo wall lights under a scalloped cove ceiling; a floating TV unit framed in marble with a dark inset and warm under-glow; and an intimate TV lounge in walnut, battens and veined marble.',
    highlights: ['Fluted headboard + moulded panels', 'Scalloped cove ceiling', 'Marble-framed floating TV units', 'Sliding glass to balcony'],
    images: ['bedroom-grey', 'bedroom-tv-marble', 'tv-lounge', 'ceiling-bedroom-cove']
  },
  kitchen: {
    num: '05', title: 'Modular <em>Kitchen</em>', plain: 'Modular Kitchen',
    meta: [['Type', 'Residential interior'], ['Space', 'Kitchen'], ['Scope', '3D model & render']],
    desc: 'An L-shaped modular kitchen in champagne high-gloss with black edge profiles, a grey-veined stone backsplash under continuous task lighting, a glass-fronted wall unit and a full-height smoked-glass tall unit for the pantry.',
    highlights: ['L-shaped run with corner window', 'Champagne gloss + black profiles', 'Continuous under-cabinet LED', 'Smoked-glass tall pantry'],
    images: ['kitchen-l-shape', 'kitchen-hob']
  },
  bath: {
    num: '06', title: 'Stone &amp; <em>Onyx Baths</em>', plain: 'Stone & Onyx Baths',
    meta: [['Type', 'Residential interior'], ['Space', 'Bathrooms'], ['Scope', '3D model & render']],
    desc: 'Two moods for wet spaces. One wraps in travertine-toned slabs with a verde onyx feature, smoked-glass partition, black fittings and a linear-lit ceiling. The other is a monolithic grey stone shower room with a warm-lit niche, wall-hung fixtures and a blush-toned vanity.',
    highlights: ['Verde onyx feature slab', 'Smoked-glass wet-zone partition', 'Linear-lit ceiling with spot downlights', 'Monolithic stone shower with lit niche'],
    images: ['bath-marble-tub', 'bath-marble-ceiling', 'bath-stone-wc', 'bath-stone-shower', 'bath-stone-door']
  },
  exterior: {
    num: '07', title: 'Residential <em>Elevations</em>', plain: 'Residential Elevations',
    meta: [['Type', 'Exterior'], ['Space', 'Facade · street view'], ['Scope', '3D model & render']],
    desc: 'Facade studies for G+1 homes: a corner elevation framed by a deep brown band with a ledge-stone column, vertical fins and cove-lit soffits; and a street-front section view studying volumes, boundary wall and the main gate in context.',
    highlights: ['Brown frame band + ledge-stone column', 'Cove-lit soffits', 'Vertical fins on balcony', 'Street-context section view'],
    images: ['exterior-corner', 'exterior-section']
  }
};
window.PROJECT_ORDER = ['living', 'stair', 'dining', 'bedroom', 'kitchen', 'bath', 'exterior'];

/* Archive — every unique view, tagged for filtering. shape: w = wide, t = tall */
window.ARCHIVE = [
  ['living-teal-sofa', 'Living', 'Teal sectional & marble wall', 'w'],
  ['stair-leaf-panels', 'Staircase', 'Leaf-motif stairwell'],
  ['kitchen-l-shape', 'Kitchen', 'L-shaped modular kitchen'],
  ['bath-stone-shower', 'Bath', 'Stone shower with lit niche', 't'],
  ['bedroom-grey', 'Bedroom', 'Fluted headboard wall'],
  ['exterior-corner', 'Exterior', 'Corner elevation'],
  ['dining-tv-arch', 'Dining', 'Dining with arch TV wall', 'w'],
  ['ceiling-led-grid', 'Ceiling', 'Back-lit grid ceiling'],
  ['bath-marble-tub', 'Bath', 'Travertine & verde onyx'],
  ['living-oval-mirrors', 'Living', 'Capsule mirrors, burgundy wall'],
  ['stair-wash-wide', 'Staircase', 'Floating stair & wash counter', 'w'],
  ['bath-stone-door', 'Bath', 'Stone bath, walnut door', 't'],
  ['bedroom-tv-marble', 'Bedroom', 'Marble-framed TV unit'],
  ['living-teal-lowangle', 'Living', 'Sectional, low angle'],
  ['dining-vanity', 'Dining', 'Dining & wash counter'],
  ['kitchen-hob', 'Kitchen', 'Hob run & task light', 'w'],
  ['ceiling-bedroom-cove', 'Ceiling', 'Scalloped cove ceiling'],
  ['tv-lounge', 'Living', 'Walnut TV lounge'],
  ['stair-wash-front', 'Staircase', 'Under-stair storage'],
  ['living-tv-staircase', 'Living', 'TV wall toward the stair', 'w'],
  ['lounge-arch-tv', 'Dining', 'Arch TV wall & vanity'],
  ['bath-stone-wc', 'Bath', 'Stone WC & vanity', 't'],
  ['bath-marble-ceiling', 'Ceiling', 'Linear-lit bath ceiling'],
  ['living-tv-wall', 'Living', 'TV wall & door detail'],
  ['exterior-section', 'Exterior', 'Street section view', 'w']
];
