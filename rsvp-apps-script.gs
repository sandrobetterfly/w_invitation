/* ============================================================================
   RSVP + Brunch orders → Google Sheet  (Google Apps Script)
   Sheet: https://docs.google.com/spreadsheets/d/1aXx-z83hDJFYD3kV-ukJaIDmPeA51jUG4TkGkPeZrCw/edit

   HOW TO DEPLOY (about 2 minutes):
   1. Open the Google Sheet above.
   2. Menu: Extensions → Apps Script.
   3. Delete whatever code is there, paste ALL of this file, click the Save icon.
   4. Click "Deploy" (top right) → "New deployment".
   5. Click the gear ⚙ next to "Select type" → choose "Web app".
   6. Description: anything (e.g. "RSVP").
      Execute as: "Me".
      Who has access: "Anyone".
   7. Click "Deploy" → "Authorize access" → pick your Google account → Allow.
      (If it warns "Google hasn't verified this app", click "Advanced" →
       "Go to <project> (unsafe)" — it's your own script, it's fine.)
   8. Copy the "Web app" URL (it ends with /exec).
   9. Send that URL back, and it gets pasted into RSVP_ENDPOINT in index.html.

   Test: paste the /exec URL in a browser — it should say "RSVP endpoint is live."

   RE-DEPLOYING AN UPDATE (keeps the same /exec URL, so nothing in the site
   needs changing): Deploy → Manage deployments → pencil ✏ → Version: New
   version → Deploy. A plain "New deployment" would mint a NEW url instead.

   Two destinations: wedding RSVPs land on the 'RSVPs' tab; brunch orders
   (posted with type=brunch from /brunch) land on a 'Brunch' tab, created
   automatically on the first order.
   ============================================================================ */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // avoid two submissions writing the same row
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var p = (e && e.parameter) || {};

    // Brunch orders (from /brunch) carry type=brunch and go to their own tab.
    if (String(p.type || '').toLowerCase() === 'brunch') {
      var bs = ss.getSheetByName('Brunch');
      if (!bs) {
        bs = ss.insertSheet('Brunch');
      }
      if (bs.getLastRow() === 0) {
        bs.appendRow(['First name', 'Last name', 'Dish', 'Coffee', 'Ordered at (browser)', 'Received at (sheet)']);
      }
      bs.appendRow([
        p.first || '',
        p.last || '',
        p.food || '',
        p.coffee || '',
        p.orderedAt || '',
        new Date()
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Otherwise: a wedding RSVP, exactly as before.
    var sheet = ss.getSheetByName('RSVPs') || ss.getSheets()[0];

    // Add a header row the first time.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['First name', 'Last name', 'Sent by', 'Responded at (browser)', 'Received at (sheet)']);
    }

    sheet.appendRow([
      p.first || '',
      p.last || '',
      p.sender || '',
      p.respondedAt || '',
      new Date()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you confirm the deployment works by opening the /exec URL in a browser.
// The version tag is how you can tell WHICH build is actually deployed: after a
// "New version" deploy this must read v2-brunch. If it still says v1, the deploy
// did not take and brunch orders are not reaching the Brunch tab yet.
function doGet() {
  return ContentService.createTextOutput('RSVP endpoint is live. [v2-brunch]');
}
