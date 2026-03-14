/**
 * 15 fully-developed campaign templates for TrueFans LOOP.
 * Artists pick a template and only need to swap in their own details
 * (artist name, dates, specific reward items, links).
 *
 * Placeholders use [BRACKETS] so artists know exactly what to replace.
 */

const campaignTemplates = [
  // ── 1. PRE-SAVE ──────────────────────────────────────────────
  {
    type: 'pre-save',
    name: 'Pre-Save Campaign',
    emoji: '🎵',
    tagline: 'Build hype before your release drops',
    description: 'Drive pre-saves on Spotify, Apple Music & more while growing your email list. Fans share to unlock exclusive bonus tracks and early access.',
    headline: 'Be the First to Hear "[SONG/ALBUM TITLE]"',
    subheadline: 'Pre-save now, share with friends, and unlock exclusive rewards before anyone else.',
    campaign_description: '[ARTIST NAME] is dropping something special on [RELEASE DATE]. Pre-save now to get it the second it drops — and share your unique link to unlock unreleased bonus tracks, behind-the-scenes content, and more. The more friends you bring, the bigger your rewards.',
    brand_colors: { primary_color: '#8B5CF6', secondary_color: '#EC4899' },
    share_messages: {
      twitter: '🔥 I just pre-saved [ARTIST NAME]\'s new drop "[SONG TITLE]" — you need to hear this. Pre-save & get rewards: {link}',
      whatsapp: 'Yo check this out — [ARTIST NAME] is dropping new music on [DATE] and if you pre-save through my link we both get exclusive rewards 🎵 {link}',
      email_subject: 'You NEED to pre-save this — [ARTIST NAME] new release',
      email_body: 'Hey!\n\nI just pre-saved [ARTIST NAME]\'s upcoming release "[SONG TITLE]" and I\'m unlocking exclusive rewards by sharing. If you pre-save through my link, I get closer to unlocking unreleased tracks and you\'ll get the song the second it drops.\n\nPre-save here: {link}\n\nTrust me, you don\'t want to miss this one.'
    },
    reward_tiers: [
      { tier_name: 'Early Bird', referrals_required: 1, description: 'Exclusive acoustic demo of the single sent to your inbox' },
      { tier_name: 'Insider', referrals_required: 3, description: 'Behind-the-scenes video of the recording session' },
      { tier_name: 'Superfan', referrals_required: 5, description: 'Unreleased bonus track download (exclusive to referrers)' },
      { tier_name: 'Street Team', referrals_required: 10, description: 'Signed digital artwork + credits in the album liner notes' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Private group video call with [ARTIST NAME] before release day' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Signed physical copy + handwritten thank-you note mailed to you' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Your name in the album credits + lifetime VIP access to all future drops' }
    ]
  },

  // ── 2. MERCH DROP ────────────────────────────────────────────
  {
    type: 'merch-drop',
    name: 'Merch Drop',
    emoji: '👕',
    tagline: 'Launch limited-edition merch with viral buzz',
    description: 'Create urgency around a limited merch release. Fans share to unlock discounts, free items, and exclusive colorways.',
    headline: 'Limited Edition "[COLLECTION NAME]" Merch Drop',
    subheadline: 'Sign up for early access. Share to unlock exclusive discounts and free merch.',
    campaign_description: '[ARTIST NAME] is dropping a limited-edition merch collection on [DROP DATE]. Sign up now for early access before it sells out — and share your link to unlock increasing discounts, free items, and exclusive colorways only available to top referrers.',
    brand_colors: { primary_color: '#F59E0B', secondary_color: '#EF4444' },
    share_messages: {
      twitter: '🔥 [ARTIST NAME] is dropping limited merch and I just locked in early access. Sign up through my link and we both win: {link}',
      whatsapp: 'Heads up — [ARTIST NAME] has a limited merch drop coming and I got early access. Use my link to get in too, plus I unlock free merch the more people sign up 👕 {link}',
      email_subject: '[ARTIST NAME] limited merch drop — get early access',
      email_body: 'Hey!\n\n[ARTIST NAME] is releasing limited-edition merch on [DATE] and I just got early access. If you sign up through my link, you get first dibs too and I unlock bigger rewards.\n\nGet in here: {link}\n\nThis stuff WILL sell out.'
    },
    reward_tiers: [
      { tier_name: 'Early Access', referrals_required: 1, description: '10% discount code for the merch drop' },
      { tier_name: 'Insider', referrals_required: 3, description: '20% discount + early access (shop 24hrs before public)' },
      { tier_name: 'Superfan', referrals_required: 5, description: 'Free sticker pack + 25% discount code' },
      { tier_name: 'Street Team', referrals_required: 10, description: 'Free limited-edition t-shirt (exclusive colorway)' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Free hoodie + exclusive merch item not available for purchase' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Full merch bundle (every item in the collection) shipped free' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Custom 1-of-1 piece designed by [ARTIST NAME] + full collection' }
    ]
  },

  // ── 3. TICKET GIVEAWAY ──────────────────────────────────────
  {
    type: 'ticket-giveaway',
    name: 'Ticket Giveaway',
    emoji: '🎫',
    tagline: 'Give away concert tickets to drive signups',
    description: 'Raffle off VIP tickets, meet & greets, and backstage passes. Every referral = another entry. Fans go wild sharing.',
    headline: 'Win VIP Tickets to See [ARTIST NAME] Live',
    subheadline: 'Enter free. Share your link for bonus entries. More shares = more chances to win.',
    campaign_description: 'Want to see [ARTIST NAME] live at [VENUE] on [DATE]? Enter this giveaway for a chance to win VIP tickets, backstage access, and more. Every friend you refer gives you bonus entries — the more you share, the better your odds. Top referrers get guaranteed prizes even if they don\'t win the grand prize.',
    brand_colors: { primary_color: '#06B6D4', secondary_color: '#8B5CF6' },
    share_messages: {
      twitter: '🎫 I just entered to win VIP tickets to [ARTIST NAME] at [VENUE]! Every share = bonus entries. Enter through my link: {link}',
      whatsapp: 'I entered a giveaway for VIP tickets to see [ARTIST NAME] live! If you enter through my link I get bonus entries 🎫🙏 {link}',
      email_subject: 'Win VIP tickets to [ARTIST NAME] — enter free',
      email_body: 'Hey!\n\nI just entered a giveaway for VIP tickets to see [ARTIST NAME] at [VENUE] on [DATE]. You can enter for free and every person who signs up through my link gives me extra entries.\n\nEnter here: {link}\n\nEven if you don\'t win the grand prize, top referrers get guaranteed rewards like signed merch and exclusive content.'
    },
    reward_tiers: [
      { tier_name: 'Entered', referrals_required: 1, description: '5 bonus raffle entries for the VIP tickets' },
      { tier_name: 'Booster', referrals_required: 3, description: '15 bonus entries + exclusive digital wallpaper pack' },
      { tier_name: 'Superfan', referrals_required: 5, description: '30 bonus entries + signed poster (guaranteed, win or lose)' },
      { tier_name: 'Street Team', referrals_required: 10, description: '50 bonus entries + free general admission ticket (guaranteed)' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Guaranteed pair of GA tickets + priority upgrade to VIP' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Guaranteed VIP tickets for two + backstage tour' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Guaranteed front-row VIP + backstage meet & greet + signed merch bundle' }
    ]
  },

  // ── 4. EXCLUSIVE CONTENT ────────────────────────────────────
  {
    type: 'exclusive-content',
    name: 'Exclusive Content Unlock',
    emoji: '🔓',
    tagline: 'Gate premium content behind referrals',
    description: 'Offer unreleased tracks, videos, demos, and behind-the-scenes content. Fans unlock more as they refer friends.',
    headline: 'Unlock [ARTIST NAME]\'s Vault of Unreleased Music',
    subheadline: 'Sign up free. Share to unlock demos, unreleased tracks, and exclusive videos.',
    campaign_description: '[ARTIST NAME] is opening the vault — unreleased demos, scrapped tracks, studio sessions, and content nobody has ever heard. Sign up to get your first exclusive track free, then share your link to unlock deeper levels of the vault. The more friends you bring, the more you hear.',
    brand_colors: { primary_color: '#7C3AED', secondary_color: '#06B6D4' },
    share_messages: {
      twitter: '🔓 [ARTIST NAME] just opened their vault of unreleased music. I already got an exclusive track — unlock yours: {link}',
      whatsapp: '[ARTIST NAME] is giving away unreleased music and behind-the-scenes content. I got a free track just for signing up. Get yours: {link}',
      email_subject: '[ARTIST NAME] unreleased music vault — free access',
      email_body: 'Hey!\n\n[ARTIST NAME] just opened their vault of unreleased content and I already got an exclusive track just for signing up. The more people I refer, the more I unlock — demos, scrapped songs, studio videos, the works.\n\nSign up free: {link}\n\nSeriously, some of these unreleased tracks are better than the album cuts.'
    },
    reward_tiers: [
      { tier_name: 'Key Holder', referrals_required: 1, description: 'Unreleased demo track download' },
      { tier_name: 'Explorer', referrals_required: 3, description: 'Studio session video + second unreleased track' },
      { tier_name: 'Collector', referrals_required: 5, description: 'Full 3-track unreleased EP download' },
      { tier_name: 'Archivist', referrals_required: 10, description: 'Voice memo collection — raw song ideas from [ARTIST NAME]\'s phone' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Full unreleased album + handwritten lyrics PDF' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Monthly exclusive content drops for 6 months + video commentary' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Co-listen session with [ARTIST NAME] + lifetime vault access' }
    ]
  },

  // ── 5. MEET & GREET ────────────────────────────────────────
  {
    type: 'meet-greet',
    name: 'Meet & Greet',
    emoji: '🤝',
    tagline: 'Reward top fans with personal access',
    description: 'Give your biggest promoters face time. Video calls, backstage access, or private events — earned through referrals.',
    headline: 'Meet [ARTIST NAME] — Earned by Your Biggest Fans',
    subheadline: 'Share your link and climb the ranks. Top fans get personal time with [ARTIST NAME].',
    campaign_description: 'This isn\'t a random lottery — it\'s a meritocracy. The fans who do the most to spread [ARTIST NAME]\'s music earn direct access. Sign up, share your unique link, and climb the ranks. Top referrers get video calls, backstage passes, private dinners, and more.',
    brand_colors: { primary_color: '#EC4899', secondary_color: '#F59E0B' },
    share_messages: {
      twitter: '🤝 Top fans get to actually MEET [ARTIST NAME]. I\'m climbing the ranks — join through my link and help me get there: {link}',
      whatsapp: 'So [ARTIST NAME] is doing meet & greets for their top fans and I\'m trying to earn mine. Sign up through my link to help me out! {link}',
      email_subject: 'Help me meet [ARTIST NAME] — sign up through my link',
      email_body: 'Hey!\n\n[ARTIST NAME] is giving their biggest fans the chance to actually meet them — video calls, backstage passes, even a private dinner for the #1 fan. I\'m trying to earn my spot and every signup through my link gets me closer.\n\nSign up here (it\'s free): {link}\n\nPlus you get your own link and can earn rewards too!'
    },
    reward_tiers: [
      { tier_name: 'Supporter', referrals_required: 1, description: 'Personalized thank-you video from [ARTIST NAME]' },
      { tier_name: 'Advocate', referrals_required: 3, description: 'Signed 8x10 photo mailed to you' },
      { tier_name: 'Superfan', referrals_required: 5, description: 'Live Q&A group video call (small group of top fans)' },
      { tier_name: 'Street Team', referrals_required: 10, description: '1-on-1 video call with [ARTIST NAME] (15 min)' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Backstage meet & greet at next show near you' },
      { tier_name: 'VIP', referrals_required: 50, description: 'VIP dinner with [ARTIST NAME] + 2 concert tickets' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Co-write session or studio visit + lifetime VIP status' }
    ]
  },

  // ── 6. FAN CLUB ─────────────────────────────────────────────
  {
    type: 'fan-club',
    name: 'Fan Club Launch',
    emoji: '⭐',
    tagline: 'Build an exclusive inner-circle community',
    description: 'Launch or grow your official fan club. Referral-gated tiers create urgency and community pride.',
    headline: 'Join [ARTIST NAME]\'s Official Fan Club — "[CLUB NAME]"',
    subheadline: 'Get exclusive perks, early access to everything, and earn your rank.',
    campaign_description: 'Welcome to [CLUB NAME] — [ARTIST NAME]\'s official fan community. Members get early access to music, merch, tickets, and exclusive content. But the real magic? The more members you recruit, the higher your rank — and the bigger your perks. This is how real fans build a movement.',
    brand_colors: { primary_color: '#10B981', secondary_color: '#8B5CF6' },
    share_messages: {
      twitter: '⭐ I just joined [ARTIST NAME]\'s official fan club "[CLUB NAME]" — early music, exclusive merch, the works. Join up: {link}',
      whatsapp: 'I joined [ARTIST NAME]\'s fan club and it\'s legit — early access to everything. Join through my link so I can rank up! {link}',
      email_subject: 'Join [ARTIST NAME]\'s official fan club with me',
      email_body: 'Hey!\n\nI just joined [ARTIST NAME]\'s official fan club "[CLUB NAME]" and it\'s actually incredible — early music access, exclusive content, members-only merch, and more.\n\nJoin through my link: {link}\n\nThe more members I recruit, the higher I rank and the better my perks get. Plus you\'ll get your own rank to climb too!'
    },
    reward_tiers: [
      { tier_name: 'Member', referrals_required: 1, description: 'Official digital membership card + welcome message from [ARTIST NAME]' },
      { tier_name: 'Bronze', referrals_required: 3, description: 'Members-only Discord/group chat access' },
      { tier_name: 'Silver', referrals_required: 5, description: 'Monthly exclusive content drops + member-only merch store access' },
      { tier_name: 'Gold', referrals_required: 10, description: 'Early access to all releases (48hrs before public) + priority ticket access' },
      { tier_name: 'Platinum', referrals_required: 25, description: 'Quarterly video call with [ARTIST NAME] + free merch item each quarter' },
      { tier_name: 'Diamond', referrals_required: 50, description: 'Annual VIP experience + all merch free + name on fan wall' },
      { tier_name: 'Founding Legend', referrals_required: 100, description: 'Permanent founding member status + lifetime perks + studio visit invitation' }
    ]
  },

  // ── 7. CONTEST ──────────────────────────────────────────────
  {
    type: 'contest',
    name: 'Fan Contest',
    emoji: '🏆',
    tagline: 'Gamified competition with prizes at every level',
    description: 'Run a timed contest where fans compete on a leaderboard. Prizes for top spots plus guaranteed rewards at every tier.',
    headline: '[ARTIST NAME]\'s Ultimate Fan Challenge',
    subheadline: 'Compete for the #1 spot. Every referral earns points. Prizes at every level.',
    campaign_description: 'Think you\'re [ARTIST NAME]\'s biggest fan? Prove it. Sign up, share your link, and compete on the live leaderboard. The fan who brings the most new supporters by [END DATE] wins the grand prize — but there are guaranteed rewards at every tier. No purchase necessary. Just spread the music.',
    brand_colors: { primary_color: '#EF4444', secondary_color: '#F59E0B' },
    share_messages: {
      twitter: '🏆 I\'m competing in [ARTIST NAME]\'s fan challenge for the #1 spot. Help me win — sign up free: {link}',
      whatsapp: 'I entered [ARTIST NAME]\'s fan competition and I\'m trying to win the grand prize! Can you sign up through my link? It\'s free and helps me climb the leaderboard 🏆 {link}',
      email_subject: 'Help me win [ARTIST NAME]\'s fan challenge!',
      email_body: 'Hey!\n\nI entered [ARTIST NAME]\'s Ultimate Fan Challenge and I\'m competing for some incredible prizes. Every friend I get to sign up through my link moves me up the leaderboard.\n\nSign up free here: {link}\n\nThe grand prize is [GRAND PRIZE] and I really want to win. Plus you get your own link and can compete too!'
    },
    reward_tiers: [
      { tier_name: 'Contender', referrals_required: 1, description: 'Exclusive contest participant badge + digital download' },
      { tier_name: 'Competitor', referrals_required: 3, description: 'Limited-edition contest sticker pack' },
      { tier_name: 'Challenger', referrals_required: 5, description: 'Contest-exclusive t-shirt (not available anywhere else)' },
      { tier_name: 'Top Fan', referrals_required: 10, description: 'Signed album + shoutout on [ARTIST NAME]\'s social media' },
      { tier_name: 'Elite', referrals_required: 25, description: 'VIP concert tickets + meet & greet' },
      { tier_name: 'Champion', referrals_required: 50, description: 'Full merch bundle + private video call + concert tickets for 4' },
      { tier_name: 'Grand Champion', referrals_required: 100, description: 'Grand prize: [CUSTOM GRAND PRIZE — e.g., studio session, private concert, year of VIP]' }
    ]
  },

  // ── 8. ALBUM RELEASE ────────────────────────────────────────
  {
    type: 'album-release',
    name: 'Album Release Party',
    emoji: '💿',
    tagline: 'Build a launch squad for your album drop',
    description: 'Rally fans around your album release. Early listeners become promoters who unlock deluxe tracks, vinyl, and release-night access.',
    headline: '"[ALBUM TITLE]" Drops [DATE] — Join the Launch Squad',
    subheadline: 'Get early access, deluxe bonus tracks, and exclusive merch. Share to unlock more.',
    campaign_description: '[ARTIST NAME]\'s new album "[ALBUM TITLE]" drops [RELEASE DATE]. Join the launch squad to hear it first, unlock deluxe bonus tracks, and earn exclusive album merch. The more fans you bring in, the deeper your rewards go — from early streaming access to signed vinyl and private listening party invites.',
    brand_colors: { primary_color: '#6D28D9', secondary_color: '#DC2626' },
    share_messages: {
      twitter: '💿 [ARTIST NAME]\'s album "[ALBUM TITLE]" drops [DATE] — I\'m on the launch squad getting early access. Join me: {link}',
      whatsapp: '[ARTIST NAME]\'s new album drops [DATE] and I got early access by joining the launch squad. You should too — plus I unlock bonus tracks when you join: {link}',
      email_subject: '[ARTIST NAME] new album — join the launch squad for early access',
      email_body: 'Hey!\n\n[ARTIST NAME] is releasing their new album "[ALBUM TITLE]" on [DATE] and I\'m on the launch squad. I already have early access and I\'m unlocking deluxe bonus tracks by sharing.\n\nJoin the squad: {link}\n\nYou get early access too, and we both unlock more rewards.'
    },
    reward_tiers: [
      { tier_name: 'Listener', referrals_required: 1, description: 'Early streaming access — hear the album 24hrs before everyone' },
      { tier_name: 'Fan', referrals_required: 3, description: '2 deluxe bonus tracks not on the standard album' },
      { tier_name: 'Superfan', referrals_required: 5, description: 'Digital deluxe edition + album commentary track by [ARTIST NAME]' },
      { tier_name: 'Promoter', referrals_required: 10, description: 'Signed CD/vinyl + album art poster' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Private virtual listening party with [ARTIST NAME] + Q&A' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Limited-edition box set + handwritten lyrics page' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Credit on the album + invite to the in-person release party + full box set' }
    ]
  },

  // ── 9. LISTENING PARTY ──────────────────────────────────────
  {
    type: 'listening-party',
    name: 'Listening Party',
    emoji: '🎧',
    tagline: 'Host a live listening event fans earn their way into',
    description: 'Stream new music live with fans. Referral tiers gate access from general admission to VIP front-row seats.',
    headline: '[ARTIST NAME] Live Listening Party — "[TITLE]"',
    subheadline: 'Earn your seat. Share to upgrade from GA to front-row VIP.',
    campaign_description: '[ARTIST NAME] is hosting an exclusive listening party for "[TITLE]" on [DATE]. Sign up for general access, then share your link to upgrade your seat. Top referrers get front-row VIP, direct chat access during the stream, and exclusive bonus content after the event.',
    brand_colors: { primary_color: '#0891B2', secondary_color: '#7C3AED' },
    share_messages: {
      twitter: '🎧 [ARTIST NAME] is hosting a listening party for "[TITLE]" and I just locked in my spot. Grab yours: {link}',
      whatsapp: '[ARTIST NAME] listening party coming up! I got my spot and I\'m upgrading to VIP by sharing. Join through my link: {link}',
      email_subject: 'Listening party invite — [ARTIST NAME] x "[TITLE]"',
      email_body: 'Hey!\n\n[ARTIST NAME] is hosting a live listening party for their new project "[TITLE]" and I got in. The more friends I bring, the better my seat gets — I\'m going for front-row VIP.\n\nGrab your spot: {link}\n\nYou\'ll love this.'
    },
    reward_tiers: [
      { tier_name: 'General Admission', referrals_required: 1, description: 'Confirmed seat at the virtual listening party' },
      { tier_name: 'Preferred Seating', referrals_required: 3, description: 'Priority entry + live chat access during the stream' },
      { tier_name: 'Front Row', referrals_required: 5, description: 'Front-row virtual seat + your name on screen during event' },
      { tier_name: 'Backstage', referrals_required: 10, description: 'Post-event backstage hangout with [ARTIST NAME] (15 min group call)' },
      { tier_name: 'VIP', referrals_required: 25, description: 'Private pre-event sound check session + signed event poster' },
      { tier_name: 'Producer\'s Chair', referrals_required: 50, description: '1-on-1 conversation with [ARTIST NAME] about the creative process' },
      { tier_name: 'Legend', referrals_required: 100, description: 'In-person listening party invite (if local) or private virtual event for you + 5 friends' }
    ]
  },

  // ── 10. TOUR ANNOUNCEMENT ───────────────────────────────────
  {
    type: 'tour-announcement',
    name: 'Tour Announcement',
    emoji: '🚌',
    tagline: 'Build demand and fill venues before tickets drop',
    description: 'Announce your tour and let fans unlock presale codes, upgrades, and backstage access by referring friends.',
    headline: '[ARTIST NAME] [YEAR] Tour — Get Presale Access',
    subheadline: 'Sign up for presale codes. Share to unlock VIP upgrades and backstage passes.',
    campaign_description: '[ARTIST NAME] is hitting the road in [YEAR]! Sign up now to get presale access before tickets go public. Share your link to unlock VIP upgrades, backstage passes, and exclusive tour merch. Help us prove there\'s demand in YOUR city — the more signups from your area, the more likely we add a date there.',
    brand_colors: { primary_color: '#D946EF', secondary_color: '#F59E0B' },
    share_messages: {
      twitter: '🚌 [ARTIST NAME] just announced their [YEAR] tour! I got presale access. Get yours: {link}',
      whatsapp: '[ARTIST NAME] is going on tour and I got presale access! Sign up through my link to get yours too — plus I unlock VIP upgrades: {link}',
      email_subject: '[ARTIST NAME] tour announced — presale access',
      email_body: 'Hey!\n\n[ARTIST NAME] just announced their [YEAR] tour and I locked in presale access. You can get it too through my link — and the more people who sign up from our city, the more likely they add a date near us.\n\nGet presale access: {link}\n\nI\'m also earning VIP upgrades by sharing!'
    },
    reward_tiers: [
      { tier_name: 'Presale', referrals_required: 1, description: 'Presale code — buy tickets before the general public' },
      { tier_name: 'Priority', referrals_required: 3, description: 'Priority presale (buy 30min before standard presale) + digital tour poster' },
      { tier_name: 'Upgraded', referrals_required: 5, description: 'Free upgrade from GA to preferred seating/viewing area' },
      { tier_name: 'VIP Access', referrals_required: 10, description: 'VIP upgrade + early venue entry + exclusive tour merch item' },
      { tier_name: 'Backstage', referrals_required: 25, description: 'Backstage pass for pre-show meet & greet' },
      { tier_name: 'Tour Crew', referrals_required: 50, description: 'Backstage tour + soundcheck access + signed setlist' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Full VIP experience at any tour date + tour bus meet + all-access pass' }
    ]
  },

  // ── 11. MUSIC VIDEO PREMIERE ────────────────────────────────
  {
    type: 'music-video',
    name: 'Music Video Premiere',
    emoji: '🎬',
    tagline: 'Build an audience for your video premiere',
    description: 'Create buzz for your music video drop. Fans earn early viewing, behind-the-scenes footage, and director\'s cut access.',
    headline: '"[SONG TITLE]" Music Video — Premiere Access',
    subheadline: 'See it before the world. Share to unlock behind-the-scenes and director\'s cut.',
    campaign_description: '[ARTIST NAME]\'s music video for "[SONG TITLE]" premieres on [DATE]. Sign up for a premiere reminder and early access. Share your link to unlock the behind-the-scenes documentary, bloopers, director\'s cut, and exclusive premiere watch party access.',
    brand_colors: { primary_color: '#E11D48', secondary_color: '#7C3AED' },
    share_messages: {
      twitter: '🎬 [ARTIST NAME]\'s music video for "[SONG TITLE]" is coming and I got premiere access. Don\'t miss it: {link}',
      whatsapp: '[ARTIST NAME] is dropping a music video for "[SONG TITLE]" and I got early access! Sign up through my link to see it first: {link}',
      email_subject: '[ARTIST NAME] music video premiere — see it first',
      email_body: 'Hey!\n\n[ARTIST NAME] is premiering the music video for "[SONG TITLE]" on [DATE] and I\'ve got early access. The video looks insane.\n\nGet premiere access: {link}\n\nI\'m also unlocking behind-the-scenes content by sharing. You\'ll get your own link too!'
    },
    reward_tiers: [
      { tier_name: 'Preview', referrals_required: 1, description: 'See the video 24hrs before public premiere' },
      { tier_name: 'Behind the Scenes', referrals_required: 3, description: 'BTS making-of documentary (10 min)' },
      { tier_name: 'Director\'s Cut', referrals_required: 5, description: 'Extended director\'s cut with alternate scenes' },
      { tier_name: 'Premiere Party', referrals_required: 10, description: 'Virtual premiere watch party with [ARTIST NAME] + live commentary' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Full BTS footage + bloopers + [ARTIST NAME] video diary' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Signed movie-style poster + credit in video description' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Cameo in next video OR private screening + video call with director & [ARTIST NAME]' }
    ]
  },

  // ── 12. VINYL / PHYSICAL PRE-ORDER ──────────────────────────
  {
    type: 'vinyl-preorder',
    name: 'Vinyl / Physical Pre-Order',
    emoji: '📀',
    tagline: 'Drive pre-orders for physical releases',
    description: 'Build a waitlist for vinyl, CDs, or cassettes. Referrers unlock limited colorways, signed copies, and test pressings.',
    headline: '"[ALBUM TITLE]" on Vinyl — Pre-Order Waitlist',
    subheadline: 'Join the waitlist. Share to unlock limited colorways and signed pressings.',
    campaign_description: '[ARTIST NAME] is pressing "[ALBUM TITLE]" on vinyl and quantities are extremely limited. Join the waitlist to guarantee your copy when pre-orders open. Share your link to unlock exclusive colorways, signed copies, and — for the biggest supporters — a rare test pressing.',
    brand_colors: { primary_color: '#B45309', secondary_color: '#1E40AF' },
    share_messages: {
      twitter: '📀 [ARTIST NAME] is pressing "[ALBUM TITLE]" on vinyl — limited run. I\'m on the waitlist. Get on it before it\'s gone: {link}',
      whatsapp: '[ARTIST NAME] vinyl pre-order is coming and supply is super limited. I got on the waitlist — join through my link so I unlock the limited colorway: {link}',
      email_subject: '[ARTIST NAME] vinyl pre-order — limited pressing',
      email_body: 'Hey!\n\nThis is going to sell out FAST — [ARTIST NAME] is pressing "[ALBUM TITLE]" on vinyl and it\'s a limited run. I got on the waitlist and I\'m trying to unlock the exclusive colorway by sharing.\n\nJoin the waitlist: {link}\n\nThey\'re doing special signed copies and test pressings for top fans too.'
    },
    reward_tiers: [
      { tier_name: 'Waitlisted', referrals_required: 1, description: 'Guaranteed pre-order access + 10% discount code' },
      { tier_name: 'Priority', referrals_required: 3, description: 'First-hour pre-order access + free shipping' },
      { tier_name: 'Collector', referrals_required: 5, description: 'Exclusive limited colorway vinyl (not available to public)' },
      { tier_name: 'Signed', referrals_required: 10, description: 'Hand-signed copy + numbered certificate of authenticity' },
      { tier_name: 'Deluxe', referrals_required: 25, description: 'Deluxe gatefold edition + bonus 7" single + signed insert' },
      { tier_name: 'Test Press', referrals_required: 50, description: 'Rare test pressing (only 10 exist) + deluxe package' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Test pressing + custom etched vinyl + [ARTIST NAME]\'s personal note + studio visit' }
    ]
  },

  // ── 13. REMIX CONTEST ───────────────────────────────────────
  {
    type: 'remix-contest',
    name: 'Remix Contest',
    emoji: '🎛️',
    tagline: 'Let producers compete while fans spread the word',
    description: 'Release stems and let producers/fans remix your track. Referrals earn votes, stems access, and the winner gets an official release.',
    headline: 'Remix "[SONG TITLE]" — Official Remix Contest',
    subheadline: 'Download stems, submit your remix, or share to vote and earn rewards.',
    campaign_description: '[ARTIST NAME] is releasing the stems for "[SONG TITLE]" and inviting producers and fans to create the official remix. Producers: download stems and submit your remix. Fans: sign up and share to earn votes for your favorite remix and unlock exclusive rewards. The winning remix gets an official release on all platforms.',
    brand_colors: { primary_color: '#059669', secondary_color: '#D946EF' },
    share_messages: {
      twitter: '🎛️ [ARTIST NAME] just dropped stems for "[SONG TITLE]" — official remix contest! Producers, get in here. Fans, share to vote: {link}',
      whatsapp: '[ARTIST NAME] is doing a remix contest for "[SONG TITLE]" — you can download stems and make your own remix! Or just share and vote for your fave: {link}',
      email_subject: 'Remix [ARTIST NAME]\'s "[SONG TITLE]" — contest now open',
      email_body: 'Hey!\n\n[ARTIST NAME] just launched an official remix contest for "[SONG TITLE]". Producers can download stems and submit remixes. Fans can vote and earn rewards by sharing.\n\nJoin the contest: {link}\n\nThe winning remix gets officially released on all streaming platforms!'
    },
    reward_tiers: [
      { tier_name: 'Voter', referrals_required: 1, description: 'Access to listen to all remix submissions + 3 votes' },
      { tier_name: 'Super Voter', referrals_required: 3, description: '10 votes + stems download access (make your own remix!)' },
      { tier_name: 'Curator', referrals_required: 5, description: 'Full stem pack + project file template + exclusive remix tutorial' },
      { tier_name: 'Producer', referrals_required: 10, description: 'Priority submission review + shoutout from [ARTIST NAME]' },
      { tier_name: 'Inner Circle', referrals_required: 25, description: 'Private production feedback session with [ARTIST NAME]\'s producer' },
      { tier_name: 'VIP', referrals_required: 50, description: 'Judge panel seat (help pick the winner) + full production sample pack' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Co-production credit on a future track + studio session invite' }
    ]
  },

  // ── 14. BACKSTAGE PASS VIP ──────────────────────────────────
  {
    type: 'backstage-pass',
    name: 'Backstage Pass VIP Experience',
    emoji: '🎤',
    tagline: 'Sell out shows and reward your street team',
    description: 'Tied to a specific show or tour date. Fans earn their way from GA to backstage through referrals.',
    headline: '[ARTIST NAME] at [VENUE] — Earn Your Backstage Pass',
    subheadline: 'Start with GA. Refer friends to upgrade all the way to backstage VIP.',
    campaign_description: '[ARTIST NAME] is performing at [VENUE] on [DATE] and this is your chance to earn the ultimate fan experience. Sign up to lock in your spot, then share your link to upgrade from general admission all the way to a full backstage VIP pass. Every friend you bring gets you closer to soundcheck access, meet & greet, and the afterparty.',
    brand_colors: { primary_color: '#BE185D', secondary_color: '#0891B2' },
    share_messages: {
      twitter: '🎤 [ARTIST NAME] at [VENUE] — I\'m earning my backstage pass by sharing. Help me get there: {link}',
      whatsapp: '[ARTIST NAME] is playing [VENUE] on [DATE] and I\'m trying to earn backstage access! Each person who signs up through my link upgrades my pass: {link}',
      email_subject: 'Help me earn backstage access to [ARTIST NAME]',
      email_body: 'Hey!\n\n[ARTIST NAME] is playing at [VENUE] on [DATE] and they\'re letting fans EARN their backstage passes. Every friend I bring through my link upgrades my access level.\n\nSign up: {link}\n\nI\'m going for full backstage VIP — soundcheck, meet & greet, afterparty, everything.'
    },
    reward_tiers: [
      { tier_name: 'GA Confirmed', referrals_required: 1, description: 'Guaranteed general admission + priority entry (skip the line)' },
      { tier_name: 'Upgraded', referrals_required: 3, description: 'Upgrade to preferred viewing area + exclusive event wristband' },
      { tier_name: 'VIP Section', referrals_required: 5, description: 'VIP section access + complimentary drink ticket' },
      { tier_name: 'Soundcheck', referrals_required: 10, description: 'Pre-show soundcheck access + VIP section + photo op' },
      { tier_name: 'Meet & Greet', referrals_required: 25, description: 'Backstage meet & greet with [ARTIST NAME] + signed poster' },
      { tier_name: 'Full Backstage', referrals_required: 50, description: 'Full backstage tour + meet & greet + signed setlist + afterparty invite' },
      { tier_name: 'Legend', referrals_required: 100, description: 'Side-stage viewing + full backstage access + afterparty VIP + signed guitar/merch' }
    ]
  },

  // ── 15. HOLIDAY / SEASONAL SPECIAL ──────────────────────────
  {
    type: 'holiday-special',
    name: 'Holiday / Seasonal Special',
    emoji: '🎁',
    tagline: 'Capitalize on seasonal moments with themed campaigns',
    description: 'Run themed campaigns around holidays, end-of-year, summer, or any seasonal moment. Festive rewards drive sharing.',
    headline: '[ARTIST NAME]\'s [HOLIDAY] Gift to You',
    subheadline: 'Unwrap exclusive rewards. Share to unlock bigger gifts for you and your friends.',
    campaign_description: 'This [HOLIDAY SEASON], [ARTIST NAME] is giving back to the fans who made this year incredible. Sign up to receive your first gift — an exclusive [HOLIDAY] track/content drop. Then share your link to unwrap bigger rewards: signed merch, exclusive bundles, video messages, and the ultimate gift for the top fan.',
    brand_colors: { primary_color: '#DC2626', secondary_color: '#15803D' },
    share_messages: {
      twitter: '🎁 [ARTIST NAME] is doing a [HOLIDAY] giveaway with exclusive gifts for fans. I already got mine — get yours: {link}',
      whatsapp: 'Happy [HOLIDAY]! [ARTIST NAME] is giving away exclusive gifts to fans and I just got an unreleased track. Get yours free: {link}',
      email_subject: '[ARTIST NAME]\'s [HOLIDAY] gift — free exclusive content',
      email_body: 'Happy [HOLIDAY]!\n\n[ARTIST NAME] is giving back this season with exclusive gifts for fans. I already unwrapped my first gift (an exclusive [HOLIDAY] track!) and I\'m sharing to unlock even more.\n\nGet your gift: {link}\n\nThe more friends you bring, the bigger the gifts get. Happy holidays!'
    },
    reward_tiers: [
      { tier_name: 'Gift 1', referrals_required: 1, description: 'Exclusive [HOLIDAY] track or acoustic version download' },
      { tier_name: 'Gift 2', referrals_required: 3, description: '[HOLIDAY]-themed digital wallpaper pack + bonus track' },
      { tier_name: 'Gift 3', referrals_required: 5, description: 'Limited-edition [HOLIDAY] sticker/pin set shipped to you' },
      { tier_name: 'Gift 4', referrals_required: 10, description: 'Personalized [HOLIDAY] video message from [ARTIST NAME]' },
      { tier_name: 'Gift 5', referrals_required: 25, description: '[HOLIDAY] merch bundle (hat, shirt, mug — themed collection)' },
      { tier_name: 'Gift 6', referrals_required: 50, description: 'Signed [HOLIDAY] exclusive vinyl/CD + handwritten holiday card' },
      { tier_name: 'Ultimate Gift', referrals_required: 100, description: 'Full [HOLIDAY] gift box + video call with [ARTIST NAME] + lifetime fan club access' }
    ]
  }
];

module.exports = campaignTemplates;
