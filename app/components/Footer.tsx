export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">אודות</h3>
            <p className="text-sm leading-relaxed">
              מדד על מחירי מזון הוא פרויקט עצמאי שנועד לספק שקיפות, ללא מניעים מסחריים.
              הנתונים מבוססים על חוק פרסום מחירי מצרכי מזון ומוצרים נפוצים בפיקוח (2014).
            </p>
            <p className="text-sm text-gray-400 mt-3">
              מחפשים להשוות מחירים ברמת המוצר?{" "}
              <a href="https://www.pricez.co.il/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">PriceZ</a>
              {" "}ו-
              <a href="https://chp.co.il/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">CHP</a>
              {" "}מציעים השוואת מחירים לפי סניף ומיקום.
            </p>
          </div>

          {/* Methodology */}
          <div>
            <h3 className="text-white font-semibold mb-3">מתודולוגיה</h3>
            <ul className="text-sm space-y-1">
              <li>37 מוצרי בסיס ב-7 קטגוריות</li>
              <li>8 רשתות סופרמרקט</li>
              <li>ממוצע גיאומטרי משוקלל</li>
              <li>עדכון יומי</li>
              <li>בסיס 100 = 15 דצמבר 2025</li>
              <li>מקור: קגל (נתונים פתוחים)</li>
            </ul>
          </div>

          {/* Links & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">קישורים ויצירת קשר</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="https://www.kaggle.com/datasets/erlichsefi/israeli-supermarkets-2024" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  מקור נתונים: Kaggle
                </a>
              </li>
              <li>
                <a href="https://github.com/OpenIsraeliSupermarkets" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  OpenIsraeliSupermarkets
                </a>
              </li>
              <li>
                <a href="https://www.cbs.gov.il" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  למ&quot;ס - מדד המחירים לצרכן
                </a>
              </li>
              <li className="pt-2">
                <a href="mailto:samuel.dratwa@gmail.com?subject=מדד על מחירי מזון" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                  צור קשר / משוב
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>המידע באתר ניתן כמות שהוא (&quot;as is&quot;) ואינו מהווה ייעוץ צרכני. השתמשו על-אחריותכם בלבד.</p>
        </div>
      </div>
    </footer>
  );
}
