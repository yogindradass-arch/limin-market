# Pre-Launch Checklist 🚀

## Before Going Live - Clean Up Demo Data

Your app currently has **sample/stock data** for testing. Here's how to prepare it for real users:

---

## Step 1: Set Up Supabase (REQUIRED)

You **must** have Supabase configured before launch, otherwise listings won't save:

1. ✅ Create Supabase project at https://supabase.com
2. ✅ Run `supabase-schema.sql` in SQL Editor
3. ✅ Create `.env` file with credentials:
   ```env
   VITE_SUPABASE_URL=your-url-here
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```
4. ✅ Uncomment AuthProvider in `src/main.tsx` (lines 5, 9, 11)
5. ✅ Uncomment useAuth in `src/App.tsx` (line 15, 43)
6. ✅ Remove demo auth in `src/components/AuthModal.tsx` (lines 18-21, 31-34)
7. ✅ Restart dev server: `npm run dev`

---

## Step 2: Remove Sample Data

### Option A: Start Completely Clean (Recommended for Launch)

Replace the sample arrays in `src/App.tsx` with empty arrays:

```typescript
// Replace lines 18-40 with:
const hotDeals: Product[] = [];
const dollarItems: Product[] = [];
const freeItems: Product[] = [];
```

This gives you a **clean slate** - perfect for launch day!

### Option B: Keep a Few Examples (Better for Testing)

Keep 1-2 items in each section so users can see the format, then remove after first real listings.

---

## Step 3: Add Empty State Messages

I've created empty states that show when sections are empty. They'll appear automatically once you clear the arrays:

**Hot Deals Section:**
```
🔥 No hot deals yet
Be the first to post a featured listing!
[Post Listing] button
```

**Dollar Express Section:**
```
💰 No budget items yet
Check back soon for great deals under $50
```

**Free Items Section:**
```
🎁 No free items yet
Have something to give away? Post it here!
```

---

## Step 4: Test the Full Flow

Before launch, test as a real user would:

1. ✅ Visit the site → See empty states
2. ✅ Click ➕ button → Post a test listing
3. ✅ Fill out form → Submit
4. ✅ Verify listing appears on homepage
5. ✅ Click listing → See details with phone number
6. ✅ Click phone number → Verify it opens phone dialer
7. ✅ Create account → Verify email confirmation works
8. ✅ Search for your listing → Verify it appears
9. ✅ Test all filters → Verify they work with real data

---

## Step 5: Launch Day Checklist

### Before You Announce:
- ☐ Supabase configured and tested
- ☐ Sample data removed OR clearly labeled as examples
- ☐ Post 2-3 real listings yourself to show how it works
- ☐ Test on mobile device (this is critical!)
- ☐ Verify phone contact works on mobile
- ☐ Check all buttons and links
- ☐ Test search with real data
- ☐ Verify filters work

### Domain & Hosting:
- ☐ Deploy to Vercel (see DEPLOYMENT.md)
- ☐ Buy liminmarket.com domain
- ☐ Configure custom domain
- ☐ Add to Supabase Site URL setting
- ☐ Test production URL

### Marketing Prep:
- ☐ Take screenshots for social media
- ☐ Write announcement post
- ☐ Prepare instructions for first users
- ☐ Have your phone ready for inquiries!

---

## Step 6: Soft Launch Strategy

**Day 1-3: Seeding Phase**
1. Post 10-15 real listings yourself across categories
2. Ask 2-3 friends to post listings
3. This shows visitors "there's stuff here!"

**Day 4-7: Friends & Family**
4. Share with close circle
5. Monitor for bugs/issues
6. Collect feedback

**Week 2+: Public Launch**
7. Post on social media
8. Share in Guyana Facebook groups
9. Word of mouth begins

---

## What Happens After You Clear Sample Data

### Good News:
- ✅ App still works perfectly
- ✅ Empty states look professional
- ✅ Users can immediately post
- ✅ Each section shows "Be the first!" messaging

### Expected Behavior:
- Home page shows empty sections with call-to-action
- Search shows "No results" until listings exist
- Filters work but return no results
- **The + button is prominently displayed**

---

## Quick Commands

### See Current Mode:
```bash
# Check if sample data is present
grep "const hotDeals" src/App.tsx
```

### Clean for Production:
```typescript
// In src/App.tsx, replace sample arrays with:
const hotDeals: Product[] = [];
const dollarItems: Product[] = [];
const freeItems: Product[] = [];
```

### Test Supabase Connection:
```bash
# Open browser console, should see:
✅ "Supabase configured successfully"

# NOT see:
❌ "Supabase is not configured"
```

---

## Emergency Rollback

If something breaks after cleaning:

```bash
git checkout src/App.tsx  # Restore sample data
npm run dev  # Restart server
```

---

## The "Chicken and Egg" Problem

**Problem:** Empty marketplace looks dead.

**Solution:** Seed it yourself!

1. **Post 5 varied items** across categories
2. **Use real photos** (from Unsplash if needed)
3. **Write good descriptions**
4. **Use your real phone number** (or a Google Voice number)
5. This gives visitors something to browse
6. Remove your listings once real ones appear

---

## Recommended Launch Sequence

```
Day -7: Set up Supabase
Day -5: Deploy to production URL
Day -3: Post 10 seed listings
Day -1: Final testing on mobile
Day 0:  Soft launch to friends
Day 3:  Collect feedback, fix bugs
Day 7:  Public announcement
Day 14: Remove seed listings as real ones appear
```

---

## Support

If you get stuck:
1. Check DEPLOYMENT.md for deployment help
2. Check SUPABASE_SETUP.md for database help
3. Check browser console for errors
4. Check Supabase logs for backend errors

---

## Final Check Before Launch

Run through this one more time:

```bash
# 1. Supabase working?
✅ Can create account
✅ Can post listing
✅ Listing appears on homepage

# 2. Mobile working?
✅ Tested on actual phone
✅ Phone links work
✅ Images load fast
✅ Forms are usable

# 3. Ready to scale?
✅ Database configured
✅ Images hosted
✅ No hardcoded data
✅ Error handling in place
```

---

**Once these are done, you're ready to launch! 🎉**

Good luck with Limin Market! 🇬🇾
