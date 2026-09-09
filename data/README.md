# מאגר הנתונים

שני הקבצים בתיקייה הזו הם בסיס הנתונים של האפליקציה. הם נטענים לתוך הבנייה,
ולכן כל שינוי שנדחף ל-`main` מתפרסם אוטומטית.

לפני שדוחפים, כדאי להריץ מקומית:

```bash
npm run validate:data
```

אותה בדיקה רצה גם ב-CI וחוסמת בנייה אם משהו לא תקין.

---

## `challenges.json`

מערך של אובייקטים, שורה אחת לרשומה:

```json
{
  "id": "11111111-0001-0001-0001-000000000001",
  "title": "אי חום עירוני",
  "category": "climate",
  "description": "ערים סופגות וקולטות חום יותר מהסביבה הכפרית..."
}
```

| שדה | חובה | כללים |
| --- | --- | --- |
| `id` | כן | מזהה ייחודי. אין לשנות מזהה קיים — קישורים שמורים מצביעים אליו |
| `title` | כן | מחרוזת לא ריקה |
| `category` | כן | אחת מ: `climate`, `water`, `structure`, `energy`, `waste`, `wellbeing`, `safety`, `mobility` |
| `description` | לא | מחרוזת או `null` |

קטגוריה שאין בה אף אתגר פשוט לא מוצגת בממשק.

---

## `solutions.json`

```json
{
  "id": "5c4b769d-58ef-4333-80bc-abd424f3e540",
  "challenge_id": "11111111-0001-0001-0001-000000000002",
  "source_type": "animal",
  "title": "נמלת הסהרה הכסופה (Saharan Silver Ant)",
  "mechanism": "שערות משולשות על גוף הנמלה מחזירות אור אינפרא-אדום...",
  "application": "ציפויי מעטפת בניין במבנה ננומטרי...",
  "image_mechanism": "solutions/5c4b769d-...-mechanism.jpg",
  "image_application": "solutions/5c4b769d-...-application.jpg",
  "visual_mechanism": "dense triangular silver hairs covering the ant's body...",
  "visual_application": "a building envelope clad in a metallic-white...",
  "metrics": { "coolingEffect": 40, "energySavings": 45 }
}
```

| שדה | חובה | כללים |
| --- | --- | --- |
| `id` | כן | מזהה ייחודי |
| `challenge_id` | כן | חייב להתאים ל-`id` של אתגר קיים |
| `source_type` | כן | `animal`, `plant` או `inanimate` |
| `title` | כן | השם באנגלית בסוגריים משמש כנושא של הפרומפט |
| `mechanism` | כן | המנגנון בטבע, בעברית |
| `application` | כן | היישום האדריכלי, בעברית |
| `image_mechanism` | לא | נתיב יחסי מתוך `public/`, או `null` |
| `image_application` | לא | נתיב יחסי מתוך `public/`, או `null` |
| `visual_mechanism` | מומלץ | תיאור חזותי באנגלית של המנגנון — ממנו נבנה הפרומפט |
| `visual_application` | מומלץ | תיאור חזותי באנגלית של היישום הבנוי |
| `metrics` | לא | ראו טבלת המדדים למטה. אפשר לכלול רק חלק מהם |

לכל פתרון שתי תמונות ולא אחת: המנגנון כפי שהוא נראה בטבע, והיישום האדריכלי.
זו הסיבה לשני שדות `image_*` ולשני שדות `visual_*`.

### מדדים

| מפתח | סולם | משמעות |
| --- | --- | --- |
| `coolingEffect` | 0–100 | הפחתת עומס חום |
| `energySavings` | 0–100 | חיסכון באנרגיה |
| `waterEfficiency` | 0–100 | יעילות מים |
| `airQuality` | 0–100 | שיפור איכות אוויר |
| `structuralStrength` | 0–10 | ביצועים מבניים |
| `ecologicalSupport` | 0–10 | ערך אקולוגי |
| `costEfficiency` | 0–10 | היתכנות כלכלית |

מדד שלא נכלל פשוט לא יוצג בכרטיס.

---

## תמונות

### ייצור אוטומטי

```bash
npm run generate:images -- --dry-run          # רק מדפיס את הפרומפטים
FAL_KEY=xxxx npm run generate:images -- --limit 4   # מייצר ארבע לבדיקה
FAL_KEY=xxxx npm run generate:images          # מייצר את כל מה שחסר
```

הסקריפט כותב קבצים ל-`public/solutions/` ומעדכן את `image_mechanism` ו-
`image_application` בקובץ הזה. אחרי שהוא רץ צריך רק לעשות commit לשני אלה —
מאותו רגע התמונות חיות בגיט ומוגשות מהאתר, בלי שום קריאה ל-API בזמן ריצה.

מפתח `FAL_KEY` מתקבל ב-https://fal.ai/dashboard/keys. הוא נחוץ רק בזמן הייצור,
לא בזמן הבנייה ולא בזמן הצפייה באתר.

### הוספה ידנית

לשים קובץ ב-`public/solutions/` ולהצביע עליו, למשל
`"image_mechanism": "solutions/termite-mound.jpg"`. הנתיב יחסי כדי שיעבוד גם
כשהאתר מוגש מתת-נתיב ב-GitHub Pages, ובודק התקינות מוודא שהקובץ באמת קיים.

### תמונה שמשתמש מעלה

נשמרת ב-`localStorage` של אותו דפדפן בלבד, דורסת את התמונה שבריפו עבור אותו
משתמש, ואינה נכנסת לגיט.

---

## שינוי סגנון התמונות

הטקסט הספציפי לכל פתרון יושב כאן, בשדות `visual_*`. הסגנון המשותף — סוג
הצילום, התאורה, איכות הרינדור — יושב ב-`src/lib/image-prompt.ts`. שינוי שם
משנה את הפרומפט של כל 144 התמונות בבת אחת.
