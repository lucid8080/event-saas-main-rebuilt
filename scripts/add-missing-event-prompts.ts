import { prisma } from "../lib/db";

async function addMissingEventPrompts() {
  try {
    console.log("🔧 Adding missing event type prompts...\n");

    // Get admin user for creating prompts
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminUser) {
      console.log("❌ No admin user found. Cannot create prompts.");
      return;
    }

    // Define all event types with their prompts
    const eventTypePrompts = {
      'BIRTHDAY_PARTY': 'vibrant birthday party celebration with colorful balloons, confetti, and festive decorations, warm and joyful atmosphere with bright lighting, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional event flyer design',
      'WEDDING': 'elegant wedding celebration with romantic floral arrangements, soft lighting, and sophisticated decor, timeless and romantic atmosphere with warm golden tones, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional wedding flyer design',
      'CORPORATE_EVENT': 'professional corporate event with modern business aesthetics, clean lines, and sophisticated design elements, professional and trustworthy atmosphere with corporate color schemes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional business flyer design',
      'HOLIDAY_CELEBRATION': 'festive holiday celebration with seasonal decorations, warm lighting, and traditional holiday elements, joyful and celebratory atmosphere with holiday color palettes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional holiday flyer design',
      'CONCERT': 'dynamic concert event with energetic lighting, stage effects, and musical atmosphere, exciting and vibrant mood with dramatic lighting and performance energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional concert flyer design',
      'SPORTS_EVENT': 'action-packed sports event with dynamic movement, competitive energy, and athletic atmosphere, energetic and competitive mood with sports equipment and arena elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional sports flyer design',
      'NIGHTLIFE': 'vibrant nightlife event with neon lighting, urban atmosphere, and contemporary club aesthetics, exciting and energetic mood with modern urban elements and nightlife energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional nightlife flyer design',
      'FAMILY_GATHERING': 'warm family gathering with cozy atmosphere, comfortable seating, and family-friendly decor, welcoming and inclusive mood with natural lighting and home-like elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional family event flyer design',
      'BBQ': 'outdoor barbecue event with grilling equipment, picnic atmosphere, and casual outdoor setting, relaxed and social mood with natural lighting and outdoor elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional BBQ event flyer design',
      'PARK_GATHERING': 'outdoor park gathering with natural scenery, open spaces, and recreational elements, peaceful and community-focused atmosphere with natural lighting and park amenities, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional park event flyer design',
      'COMMUNITY_EVENT': 'community-focused event with diverse participants, inclusive atmosphere, and local cultural elements, welcoming and collaborative mood with community spirit and local pride, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional community event flyer design',
      'FUNDRAISER': 'charitable fundraiser event with philanthropic atmosphere, donation elements, and cause-related imagery, inspiring and generous mood with altruistic themes and community support, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional fundraiser event flyer design',
      'WORKSHOP': 'educational workshop with learning environment, instructional elements, and knowledge-sharing atmosphere, informative and engaging mood with educational tools and collaborative learning, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional workshop event flyer design',
      'MEETUP': 'casual meetup with relaxed atmosphere, networking elements, and social interaction, friendly and approachable mood with informal setting and connection opportunities, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional meetup event flyer design',
      'CELEBRATION': 'general celebration with festive atmosphere, party elements, and joyful mood, happy and celebratory atmosphere with universal appeal and positive energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional celebration event flyer design',
      'REUNION': 'emotional reunion with nostalgic atmosphere, connection elements, and shared memories, warm and sentimental mood with reconnection themes and meaningful moments, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional reunion event flyer design',
      'POTLUCK': 'communal potluck with shared food atmosphere, culinary elements, and community dining, welcoming and collaborative mood with food sharing and social dining, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional potluck event flyer design',
      'GAME_NIGHT': 'entertaining game night with playful atmosphere, gaming elements, and fun activities, lively and engaging mood with entertainment and social gaming, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional game night event flyer design',
      'BOOK_CLUB': 'intellectual book club with literary atmosphere, reading elements, and discussion environment, thoughtful and engaging mood with literary themes and intellectual discourse, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional book club event flyer design',
      'ART_CLASS': 'creative art class with artistic atmosphere, creative elements, and artistic expression, inspiring and imaginative mood with artistic tools and creative exploration, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional art class event flyer design',
      'FITNESS_CLASS': 'energetic fitness class with active atmosphere, exercise elements, and health-focused environment, dynamic and motivating mood with fitness equipment and active lifestyle, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional fitness class event flyer design',
      'BREAKDANCING': 'dynamic breakdancing event with urban dance atmosphere, street dance elements, and hip-hop culture, energetic and rhythmic mood with urban dance moves and street culture, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional breakdancing event flyer design',
      'POTTERY': 'creative pottery class with artistic atmosphere, ceramic elements, and hands-on crafting, peaceful and meditative mood with artistic tools and creative expression, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional pottery class event flyer design',
      'OTHER': 'versatile event design with adaptable styling, welcoming atmosphere, and inclusive visual elements, friendly and approachable mood with universal appeal and flexible design elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional event flyer design'
    };

    console.log(`📝 Processing ${Object.keys(eventTypePrompts).length} event types...\n`);

    const createdPrompts = [];
    const skippedPrompts = [];

    // Process each event type
    for (const [eventType, promptContent] of Object.entries(eventTypePrompts)) {
      try {
        // Check if prompt already exists for this event type
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category: 'event_type',
            subcategory: eventType
          }
        });

        if (existingPrompt) {
          console.log(`✅ Already exists: ${eventType}`);
          skippedPrompts.push(eventType);
          continue;
        }

        // Create the prompt
        const prompt = await prisma.systemPrompt.create({
          data: {
            category: 'event_type',
            subcategory: eventType,
            name: `${eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Event`,
            description: `Default prompt for ${eventType.replace(/_/g, ' ').toLowerCase()} events`,
            content: promptContent,
            version: 1,
            isActive: true,
            metadata: {
              source: 'comprehensive_seeding',
              seeded: true,
              originalKey: eventType
            },
            createdBy: adminUser.id,
            updatedBy: adminUser.id
          }
        });

        createdPrompts.push(prompt);
        console.log(`✅ Created: ${eventType}`);

      } catch (error) {
        console.error(`❌ Error creating prompt for ${eventType}:`, error);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 COMPREHENSIVE SEEDING SUMMARY:");
    console.log(`   • Created: ${createdPrompts.length} new event type prompts`);
    console.log(`   • Skipped: ${skippedPrompts.length} existing prompts`);
    console.log(`   • Total event type prompts: ${await prisma.systemPrompt.count({ where: { category: 'event_type' } })}`);
    console.log("");

    if (createdPrompts.length > 0) {
      console.log("✅ Successfully added all missing event type prompts!");
      console.log("🎉 All 24 event types should now be available in the System Prompts Management.");
    }

  } catch (error) {
    console.error("❌ Error adding missing event prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMissingEventPrompts(); 