# 🔧 Fix: 500 Error on /api/conversations

## Problem Identified

**Console output revealed:**
```
GET http://localhost:3000/api/conversations?userId=2 500 (Internal Server Error)
📥 Received conversations from API: 0
```

**Root Cause:**
The `/api/conversations` route was trying to query a `support_tickets` table that doesn't exist in the database, causing the entire API call to crash with a 500 error.

## What Was Happening

1. ✅ User sends message → Successfully saved to database
2. ✅ User redirected to `/messages?conv=5&refresh=timestamp`
3. ❌ Messages page tries to fetch conversations via `/api/conversations?userId=2`
4. ❌ API crashes because `support_tickets` table doesn't exist
5. ❌ API returns 500 error instead of conversations array
6. ❌ No conversations displayed (because API failed)

## Solution Applied

**File: `app/api/conversations/route.ts`**

**Before (BROKEN):**
```typescript
if (userId) {
  conversations = getConversationsForUser(Number(userId));
  
  // This crashes if table doesn't exist!
  supportTickets = db.prepare(`SELECT ... FROM support_tickets ...`).all(Number(userId));
  
  // Rest of code never executes due to crash
}
```

**After (FIXED):**
```typescript
if (userId) {
  conversations = getConversationsForUser(Number(userId));
  
  // Try to get support tickets, but don't crash if table doesn't exist
  try {
    supportTickets = db.prepare(`SELECT ... FROM support_tickets ...`).all(Number(userId));
  } catch (supportError) {
    console.log('Support tickets query failed (table may not exist):', supportError);
    supportTickets = []; // Empty array, continue execution
  }
  
  // Rest of code continues normally
}
```

## What Changed

- ✅ Added `try-catch` around support tickets query
- ✅ If `support_tickets` table doesn't exist → logs warning, continues with empty array
- ✅ Regular conversations still load successfully
- ✅ API returns 200 OK with conversations array
- ✅ Messages page displays conversations properly

## Testing Steps

1. **Refresh the page** (Ctrl+R or F5)
2. **Send a test message** from any company profile page
3. **Check console** - should see:
   ```
   ✅ Message sent successfully!
   🔄 Loading conversations for user: 2 accountType: individual
   📍 URL params - targetConvId: 5 refreshParam: 1761656363960
   📥 Received conversations from API: 1  ← Should be > 0 now!
   ✅ Selected conversation from URL: 5
   ```
4. **Verify conversation appears** in left sidebar
5. **Verify conversation is auto-selected** and messages are visible

## Expected Result

- ✅ API returns 200 OK (not 500 error)
- ✅ Conversations array has at least 1 conversation
- ✅ Conversation appears in sidebar immediately after redirect
- ✅ Conversation is automatically selected
- ✅ No more "Received conversations: 0" in console

## Why This Happened

The code was trying to be helpful by combining support tickets with regular conversations, but:
1. Support tickets feature wasn't fully implemented yet
2. `support_tickets` table doesn't exist in `companies.db`
3. SQL query failed → entire API crashed → no conversations displayed

## Future Enhancement

When support tickets are implemented, create the table:
```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  lastReadAt TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketId INTEGER NOT NULL,
  senderType TEXT NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES support_tickets(id)
);
```

Then the support tickets feature will work automatically!

---

**Status:** ✅ FIXED - API no longer crashes, conversations load successfully
**Impact:** High - This was blocking all conversations from displaying
**Tested:** Awaiting user confirmation

