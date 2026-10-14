/* Static narrative content for Beyond the Fort */
window.BTF = {
  evidence: [
    { icon: 'fa-chart-pie', signal: 'Concentration', evidence: 'Simulated visitor counts show 67% of tracked tourist visits concentrated at two major attractions.', unknown: 'Whether concentration is due to preference, discoverability, time, transport or trust.' },
    { icon: 'fa-hourglass-half', signal: 'Stay length', evidence: 'A majority of surveyed day visitors report having 5–8 hours in the city.', unknown: 'How much itinerary complexity is realistic.' },
    { icon: 'fa-magnifying-glass-location', signal: 'Discovery', evidence: 'Small operators report depending heavily on word-of-mouth and social media.', unknown: 'How to verify listings and keep information current.' },
    { icon: 'fa-route', signal: 'Mobility', evidence: 'Several lesser-known sites are 3–8 km from the main visitor corridor.', unknown: 'Whether route, transport, safety or accessibility is the main barrier.' },
    { icon: 'fa-stamp', signal: 'Authenticity', evidence: 'Local stakeholders complain that online descriptions frequently copy outdated or inaccurate facts.', unknown: 'How authoritative local information can be maintained.' },
    { icon: 'fa-hands-praying', signal: 'Sensitivity', evidence: 'Some locations have religious, conservation or community-specific norms.', unknown: 'How recommendations should respect restrictions and local context.' }
  ],

  workflow: [
    { icon: 'fa-book-open', tag: 'Step 01 · Investigate', title: 'Read the case like an investigator', text: 'Separate facts from assumptions in the evidence pack. Note what each signal proves and what it leaves open.', points: ['6 signals mapped to evidence & uncertainty', 'Stakeholders listed with their idea of "good"', 'Boundary rules captured up-front'], out: 'artefact → evidence-map.md' },
    { icon: 'fa-users-viewfinder', tag: 'Step 02 · Stakeholders', title: 'Whose outcome dominates?', text: 'Visitors want a good day; operators want visibility; residents want calm; heritage managers want protection.', points: ['Visitors (domestic & international)', 'Guides, officials, craftspeople, food businesses', 'Residents, transport, heritage managers'], out: 'artefact → stakeholder-matrix' },
    { icon: 'fa-code-compare', tag: 'Step 03 · Frame', title: 'Compare six plausible framings', text: 'Discovery, trust, itinerary, mobility, local inclusion, content quality — scored on evidence, feasibility, inclusion and harm-avoidance.', points: ['Weighted scoring, kept transparent', 'Rejected framings documented with reasons'], out: 'artefact → framing-scorecard' },
    { icon: 'fa-bullseye', tag: 'Step 04 · Select', title: 'Narrow to one problem', text: 'Exposure and availability feed each other: when the headline event is full, there is no plan B, so small events stay invisible.', points: ['Single, testable problem statement', 'Success metric: share of visits outside top-2 sites'], out: 'artefact → problem-statement.md' },
    { icon: 'fa-flask-vial', tag: 'Step 05 · Feasibility', title: 'Test the proposal against reality', text: 'Reason-act loop over live sources. Event board, maps, media and login: buildable. Hidden-number group chat: not rentable. ID copies: legal risk.', points: ['Each feature: go / adjust / stop', 'Alternatives proposed for every "stop"'], out: 'artefact → feasibility-review.pdf' },
    { icon: 'fa-shield-heart', tag: 'Step 06 · Safety', title: 'Verify guides without ID copies', text: 'Two checks: qualified for this site (issuer confirmation) and accountable on the day (masked contact, trip-share, complaints).', points: ['No Aadhaar / PAN / licence storage', 'Site-specific credentials'], out: 'artefact → guide-verification.pdf' },
    { icon: 'fa-diagram-project', tag: 'Step 07 · Specify', title: 'Write the SRS & plan', text: 'Functional + non-functional requirements, phased roadmap, pilot metric, and the AI reasoning trail that shaped each decision.', points: ['7 functional requirements', '4 build phases + pilot', 'Audit-ready reasoning log'], out: 'artefact → srs-v1 + reasoning-trail.log' }
  ],

  framings: [
    { id: 'avail', title: 'Exposure + availability (no plan B)', text: 'Visitors cannot find what else is on when the headline is full; small events stay unseen.', s: { evidence: 5, feasible: 5, inclusion: 5, safety: 4 } },
    { id: 'disc', title: 'Discovery of lesser-known sites', text: 'Sites exist but are not findable in one place.', s: { evidence: 4, feasible: 4, inclusion: 3, safety: 3 } },
    { id: 'trust', title: 'Trust in information', text: 'Copied, outdated facts undermine confidence.', s: { evidence: 4, feasible: 3, inclusion: 2, safety: 4 } },
    { id: 'itin', title: 'Itinerary planning in 5–8 hours', text: 'Visitors cannot fit more into a short day.', s: { evidence: 3, feasible: 3, inclusion: 3, safety: 3 } },
    { id: 'mob', title: 'Mobility to 3–8 km sites', text: 'Transport and route safety block spread.', s: { evidence: 2, feasible: 2, inclusion: 3, safety: 3 } },
    { id: 'over', title: 'Over-tourism at fragile sites', text: 'Promotion could overwhelm sensitive places.', s: { evidence: 2, feasible: 3, inclusion: 2, safety: 5 } }
  ],

  verdicts: [
    { k: 'go', tag: 'Buildable', title: 'Event board', text: 'Today / tomorrow / this week listings with provenance labels and a "full" signal.', fix: '<b>Plan:</b> operator submission form + verification queue.' },
    { k: 'go', tag: 'Buildable', title: 'Map link', text: 'Deep-links to standard map apps with distance from the fort corridor.', fix: '<b>Plan:</b> no custom routing needed for v1.' },
    { k: 'go', tag: 'Buildable', title: 'Media & listings', text: 'Photos and short descriptions from operators, clearly labelled as stakeholder-provided.', fix: '<b>Plan:</b> moderation before publishing.' },
    { k: 'go', tag: 'Buildable', title: 'Phone login, every country code', text: 'E.164 number entry with OTP via an SMS provider works for international visitors.', fix: '<b>Plan:</b> browse-without-login stays available.' },
    { k: 'stop', tag: 'Not rentable', title: 'Group chat with hidden numbers', text: 'Members not seeing each other\'s numbers while the platform can is not a feature you can rent from WhatsApp or Telegram groups.', fix: '<b>Alternative:</b> in-app chat or a masked-number relay owned by the platform.' },
    { k: 'warn', tag: 'Legal risk', title: 'Collecting Aadhaar & licence copies', text: 'Storing guides\' identity documents runs against the 2018 Supreme Court ruling and adds data-protection liability.', fix: '<b>Alternative:</b> confirm credentials with issuing bodies; store only the result.' }
  ],

  trail: [
    ['t-plan', 'PLAN   ', 'Identify why 67% of visits concentrate at two attractions.'],
    ['t-act', 'ACT    ', 'Cross-read evidence: stay length 5–8h, discovery via word-of-mouth, 3–8 km sites.'],
    ['t-obs', 'OBSERVE', 'Visitors with fixed time have no fallback when headline event is full.'],
    ['t-ver', 'VERIFY ', 'Case doc confirms: "no single place to see what\'s on today, tomorrow or next week".'],
    ['t-rank', 'RANK   ', 'Framing #1 "exposure + availability" scores highest → SELECTED.'],
    ['t-plan', 'PLAN   ', 'Check feasibility of hidden-number group chat on WhatsApp/Telegram.'],
    ['t-act', 'ACT    ', 'Review platform features for member-number privacy in groups.'],
    ['t-obs', 'OBSERVE', 'No rentable feature hides numbers from members while platform keeps them.'],
    ['t-ver', 'VERIFY ', 'Decision: replace with platform-owned masked relay.'],
    ['t-plan', 'PLAN   ', 'Can we store guides\' Aadhaar / licence copies?'],
    ['t-obs', 'OBSERVE', '2018 Supreme Court ruling constrains this; storing adds liability.'],
    ['t-rank', 'RANK   ', 'Adopt two-check model: qualified (issuer) + accountable (on the day).'],
    ['t-ver', 'VERIFY ', 'Boundary respected: no invented facts, hours or accessibility claims.']
  ],

  countries: [
    ['India', '+91'], ['United States', '+1'], ['United Kingdom', '+44'], ['Canada', '+1'], ['Australia', '+61'], ['Germany', '+49'], ['France', '+33'],
    ['Japan', '+81'], ['China', '+86'], ['Singapore', '+65'], ['UAE', '+971'], ['Saudi Arabia', '+966'], ['Nepal', '+977'], ['Bangladesh', '+880'],
    ['Sri Lanka', '+94'], ['Italy', '+39'], ['Spain', '+34'], ['Netherlands', '+31'], ['Russia', '+7'], ['Brazil', '+55'], ['South Africa', '+27'],
    ['South Korea', '+82'], ['Malaysia', '+60'], ['Thailand', '+66'], ['Israel', '+972'], ['New Zealand', '+64'], ['Mexico', '+52'], ['Other (enter code)', '+']
  ],

  /* Fallbacks if table API is unavailable */
  fallbackEvents: [
    { id: 'ev1', title: 'Tansen Samaroh — Evening Raga Session', category: 'Music', venue: 'Tansen Tomb Complex, Hazira', area: 'Hazira', day_offset: 0, time: '18:30', capacity: 'full', price: 'Free entry (passes)', distance_km: 2.1, source_status: 'verified', sensitivity: 'Memorial site — silence during performance.', description: 'The headline classical music gathering. At capacity tonight.' },
    { id: 'ev2', title: 'Baithak: Dhrupad in a Haveli Courtyard', category: 'Music', venue: 'Old City Haveli', area: 'Lashkar', day_offset: 0, time: '19:00', capacity: 'open', price: '₹200', distance_km: 3.4, source_status: 'stakeholder', sensitivity: 'Private residence — photography with consent.', description: 'An intimate baithak by local students.' },
    { id: 'ev3', title: 'Sunset Walk: Teli ka Mandir & Sas-Bahu', category: 'Heritage Walk', venue: 'Gwalior Fort', area: 'Fort', day_offset: 0, time: '16:30', capacity: 'filling', price: '₹350 + ticket', distance_km: 0, source_status: 'verified', sensitivity: 'Protected monument.', description: 'Guide-led temple walk.' }
  ],
  fallbackGuides: []
};
