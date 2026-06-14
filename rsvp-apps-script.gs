/* ============================================================================
   RSVP → Google Sheet  (Google Apps Script)
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
   ============================================================================ */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // avoid two submissions writing the same row
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('RSVPs') || ss.getSheets()[0];

    // Add a header row the first time.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['First name', 'Last name', 'Responded at (browser)', 'Received at (sheet)']);
    }

    var p = (e && e.parameter) || {};
    sheet.appendRow([
      p.first || '',
      p.last || '',
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
function doGet() {
  return ContentService.createTextOutput('RSVP endpoint is live.');
}
