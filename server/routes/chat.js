import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Modify getDatabaseContext to match our simplified schema
async function getDatabaseContext() {
    try {
        // Get courses with details
        const [courses] = await db.execute(`
            SELECT 
                c.name,
                c.description,
                c.holes,
                c.location,
                c.facilities,
                c.difficulty_level,
                c.caddie_required,
                c.golf_cart_available,
                c.club_rental_available,
                COUNT(DISTINCT t.id) as total_tee_times,
                COUNT(DISTINCT b.id) as total_bookings
            FROM courses c
            LEFT JOIN tee_times t ON c.id = t.course_id
            LEFT JOIN bookings b ON t.id = b.tee_time_id
            GROUP BY c.id
        `);

        // Get detailed session availability with prices
        const [sessionAvailability] = await db.execute(`
            SELECT 
                c.name as course_name,
                c.difficulty_level,
                c.caddie_required,
                c.golf_cart_available,
                c.club_rental_available,
                CASE 
                    WHEN HOUR(t.time) BETWEEN 6 AND 11 THEN 'Morning'
                    WHEN HOUR(t.time) BETWEEN 12 AND 15 THEN 'Afternoon'
                    ELSE 'Evening'
                END as session,
                COUNT(*) as total_slots,
                SUM(t.available) as available_slots,
                GROUP_CONCAT(DISTINCT TIME_FORMAT(t.time, '%H:%i') ORDER BY t.time) as available_times
            FROM courses c
            JOIN tee_times t ON c.id = t.course_id
            WHERE t.date = CURDATE() AND t.available = true
            GROUP BY c.name, 
                CASE 
                    WHEN HOUR(t.time) BETWEEN 6 AND 11 THEN 'Morning'
                    WHEN HOUR(t.time) BETWEEN 12 AND 15 THEN 'Afternoon'
                    ELSE 'Evening'
                END
            ORDER BY c.name, session
        `);

        // Format course information
        const coursesInfo = courses.map(course => `
Course: ${course.name}
Location: ${course.location}
Holes: ${course.holes}
Difficulty: ${course.difficulty_level}
Services:${course.caddie_required ? ' Caddie Required,' : ''}${course.golf_cart_available ? ' Golf Cart Available,' : ''}${course.club_rental_available ? ' Club Rental Available' : ''}
Facilities: ${course.facilities}
Current Booking Rate: ${Math.round((course.total_bookings / (course.total_tee_times || 1)) * 100)}%
        `).join('\n\n');

        // Format session availability information
        const sessionInfo = sessionAvailability.reduce((acc, slot) => {
            if (!acc[slot.course_name]) {
                acc[slot.course_name] = [];
            }
            acc[slot.course_name].push(
                `${slot.session}: ${slot.available_slots}/${slot.total_slots} slots available`
            );
            return acc;
        }, {});

        const sessionAvailabilityInfo = Object.entries(sessionInfo)
            .map(([course, sessions]) => `
${course}:
${sessions.join('\n')}`)
            .join('\n\n');

        return `
CURRENT COURSE INFORMATION:
${coursesInfo}

AVAILABLE TEE TIMES TODAY:
${sessionAvailabilityInfo}

RECOMMENDED BOOKING TIPS:
- Morning sessions (6 AM - 12 PM): ${getSessionTip('Morning', sessionAvailability)}
- Afternoon sessions (12 PM - 4 PM): ${getSessionTip('Afternoon', sessionAvailability)}
- Evening sessions (4 PM - 7 PM): ${getSessionTip('Evening', sessionAvailability)}

Please use this real-time availability when helping customers book.`;
    } catch (error) {
        console.error('Error getting database context:', error);
        return '';
    }
}

function getSessionTip(session, availability) {
    const sessionSlots = availability.filter(slot => slot.session === session);
    const totalAvailable = sessionSlots.reduce((sum, slot) => sum + slot.available_slots, 0);
    
    if (totalAvailable === 0) return 'Fully booked';
    if (totalAvailable < 5) return 'Limited availability';
    return 'Good availability';
}

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

        // Get real-time data from database
        const databaseContext = await getDatabaseContext();
        
        // Combine static and dynamic context
        const fullContext = GOLF_CONTEXT + '\n\n' + databaseContext;
        await chat.sendMessage(fullContext);
        
        // Add context reminder to user message
        const userMessage = `Remember to be friendly, fun, and use golf puns while using our real-time course data. User question: ${message}`;
        const result = await chat.sendMessage(userMessage);
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

// Add a test route to verify the router is mounted
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Chat router is working' });
});

export default router;
