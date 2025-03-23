import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add conversation store
const conversations = new Map();

const GOLF_CONTEXT = `You are CawFee, a cheerful and witty golf assistant with a fun personality. You help users book golf courses and understand our services.

DOMAIN KNOWLEDGE:
- We offer golf courses with 9 or 18 holes
- Each course has different difficulty levels (beginner, intermediate, advanced)
- Services available: caddies, golf carts, club rentals
- Bookings can be made for 1-4 players
- We focus on Bangkok area golf courses

COURSE FEATURES TO HIGHLIGHT:
- Course difficulty level
- Available facilities
- Whether caddie is required
- Golf cart availability
- Club rental options
- Number of holes

BOOKING INFORMATION:
- Users need to select a course and date
- Tee times are available in intervals
- Maximum 4 players per booking
- Users can request additional services (caddie, cart, equipment)
- Users can add special requests

PERSONALITY:
- Friendly and helpful
- Uses golf-related puns
- Professional but approachable
- Enthusiastic about golf

SESSION TIMINGS:
- Morning Session: 6:00 AM - 11:59 AM
- Afternoon Session: 12:00 PM - 3:59 PM
- Evening Session: 4:00 PM - 7:00 PM

BOOKING PREFERENCES:
- Morning sessions are popular for cooler weather
- Afternoon sessions often have better rates
- Evening sessions offer sunset views
- Each session has different lighting and weather conditions

BOOKING GUIDANCE:
1. Ask for their preferences:
   - Preferred date and time (morning/afternoon/evening)
   - Number of players (1-4)
   - Skill level (beginner/intermediate/advanced)
   - Service requirements (caddie, cart, equipment rental)

2. Recommend courses based on:
   - Matching difficulty level to skill
   - Group size compatibility
   - Time slot availability
   - Required services availability

3. Help with special requirements:
   - Equipment rental needs
   - Golf cart preferences
   - Caddie services
   - Special assistance or requests

CONVERSATION FLOW:
1. Greet and ask about preferences
2. Suggest suitable courses with available times
3. Explain available services and facilities
4. Guide through booking steps:
   - Select course
   - Choose date and time slot
   - Specify number of players
   - Add required services
   - Add any special requests

EXAMPLE RESPONSES:
For new bookings:
"I'd be happy to help you book a tee time! Could you tell me:
1. When would you like to play? (date and preferred time of day)
2. How many players in your group? (1-4)
3. What's your skill level? (beginner/intermediate/advanced)"

For course recommendations:
"Based on your preferences, I recommend [Course Name] because:
- It's perfect for [skill level] players
- They have [X] slots available in the [morning/afternoon/evening]
- They offer [relevant services]
Would you like to know more about this course?"

For booking confirmation:
"Great choice! Let me summarize your booking:
- Course: [name]
- Date: [date]
- Time: [time]
- Players: [number]
- Services: [selected services]
Would you like me to help you complete this booking?"`;

// Enhance database context function
async function getDatabaseContext() {
    try {
        // Get courses with detailed information
        const [courses] = await db.execute(`
            SELECT 
                c.*,
                COUNT(DISTINCT t.id) as total_tee_times,
                COUNT(DISTINCT b.id) as total_bookings,
                AVG(CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END) as booking_rate,
                GROUP_CONCAT(DISTINCT t.time) as available_times
            FROM courses c
            LEFT JOIN tee_times t ON c.id = t.course_id AND t.available = 1
            LEFT JOIN bookings b ON t.id = b.tee_time_id
            GROUP BY c.id
        `);

        // Get peak hours information
        const [peakHours] = await db.execute(`
            SELECT 
                CASE 
                    WHEN HOUR(time) BETWEEN 6 AND 11 THEN 'Morning'
                    WHEN HOUR(time) BETWEEN 12 AND 16 THEN 'Afternoon'
                    ELSE 'Evening'
                END as time_slot,
                COUNT(*) as booking_count
            FROM tee_times t
            JOIN bookings b ON t.id = b.tee_time_id
            WHERE DATE(b.booking_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY time_slot
        `);

        // Format course information for AI context
        const courseInfo = courses.map(course => ({
            name: course.name,
            description: course.description,
            difficulty: course.difficulty_level,
            holes: course.holes,
            location: course.location,
            facilities: course.facilities,
            services: formatServices(course),
            popularTimes: course.available_times?.split(',') || [],
            bookingRate: Math.round(course.booking_rate * 100)
        }));

        // Create dynamic context
        const dynamicContext = `
AVAILABLE COURSES:
${courseInfo.map(course => `
- ${course.name}
  * Difficulty: ${course.difficulty}
  * Holes: ${course.holes}
  * Location: ${course.location}
  * Booking Rate: ${course.bookingRate}%
  * Services: ${course.services}
  * Facilities: ${course.facilities}
`).join('\n')}

PEAK HOURS INFORMATION:
${peakHours.map(slot => `- ${slot.time_slot}: ${slot.booking_count} bookings in last 7 days`).join('\n')}
`;

        return {
            courses: courseInfo,
            peakHours,
            dynamicContext
        };
    } catch (error) {
        console.error('Error getting database context:', error);
        throw error;
    }
}

function formatServices(course) {
    const services = [];
    if (course.caddie_required) services.push('Caddie Required');
    if (course.golf_cart_available) services.push('Golf Cart Available');
    if (course.club_rental_available) services.push('Club Rental Available');
    return services.join(', ');
}



// Update initializeChat function
async function initializeChat(userId) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
        },
    });

    // Get current database context
    const { dynamicContext } = await getDatabaseContext();
    
    // Combine static and dynamic context
    const fullContext = `${GOLF_CONTEXT}\n\nCURRENT SYSTEM STATUS:\n${dynamicContext}`;
    
    // Initialize AI with combined context
    await chat.sendMessage(`
You are CawFee, a golf booking assistant. Here is your current knowledge base including real-time course information:

${fullContext}

Important Instructions:
1. Always provide recommendations based on the current course data
2. Include specific course details when making suggestions
3. Mention current availability and peak hours when discussing timing
4. Use the actual facilities and services listed for each course

Respond with "Initialized with current course data" if you understand.
    `);

    conversations.set(userId, {
        chat,
        lastUpdate: Date.now()
    });
    
    return chat;
}

// Modify the chat route
router.post('/', auth, async (req, res) => {
    console.log('Received chat request:', req.body);

    try {
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Get or create chat instance for user
        let chat;
        if (!conversations.has(req.user.id) || 
            Date.now() - conversations.get(req.user.id).lastUpdate > 1800000) { // 30 minutes expiry
            chat = await initializeChat(req.user.id);
        } else {
            chat = conversations.get(req.user.id).chat;
            
            // Refresh database context periodically
            const databaseContext = await getDatabaseContext();
            await chat.sendMessage(`
Here is the latest database information. Use this for your next response:

${databaseContext}

Respond with the user's message: ${message}
            `);
        }

        // Update last activity
        conversations.get(req.user.id).lastUpdate = Date.now();

        // Process user message
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        console.log('AI response:', text);

        res.json({ 
            success: true, 
            message: text 
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'AI service error: ' + (error.message || 'Unknown error')
        });
    }
});

// Add cleanup for old conversations
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of conversations.entries()) {
        if (now - data.lastUpdate > 1800000) { // 30 minutes
            conversations.delete(userId);
        }
    }
}, 300000); // Clean up every 5 minutes

// Add a test route to verify the router is mounted
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Chat router is working' });
});

export default router;