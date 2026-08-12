import { RuleTester } from 'eslint'
import noUninterpolatedCodeTemplateLiteral from './no-uninterpolated-code-template-literal.js'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

ruleTester.run(
  'no-uninterpolated-code-template-literal',
  noUninterpolatedCodeTemplateLiteral,
  {
    valid: [
      // Properly interpolated — the common, correct usage.
      'const label = `Total: ${amount}`',
      'const name = `stockJournal.entries.${index}.stockItemId`',
      'const cls = `flex items-center ${open ? "gap-3" : "px-0"}`',
      // Plain strings (single quotes) are fine.
      "const s = 'formatQty(x)'",
      // Non-interpolated template literals that are plain text, not code.
      'const cls2 = `space-y-2`',
      'const cls3 = `hover:bg-secondary/75 -mx-1 flex w-full rounded-md`',
      'const unit = `-`',
      'const stateId = `stateId`',
      // Tagged templates (String.raw etc.) are exempt.
      'const raw = String.raw`rtl:**:[.rdp-button\\_next>svg]:rotate-180`',
      // Decimal-heavy text: dots before digits are not member access.
      'const amount = `8087023.46`',
      // CSS-in-JS blocks and selector lists start with non-expression tokens.
      'const css = `.print-title { font-size: 18px; font-weight: 700; text-align: center; }`',
      'const css2 = `.line-art-grid {\n  stroke-dasharray: 6:10;\n}`',
      'const sel = `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`',
    ],
    invalid: [
      // The exact regression that hit the Stock In Hand report.
      {
        code: 'const el = <div>{qty === 0 ? "-" : `formatQty(item.openingQuantity, item.noOfDecimalPlaces, item.unitCode)`}</div>',
        errors: [{ messageId: 'codeLikeTemplate' }],
      },
      {
        code: 'const v = `item.openingAmount?.toFixed(2)`',
        errors: [{ messageId: 'codeLikeTemplate' }],
      },
      {
        code: 'const v = `handleSubmit()`',
        errors: [{ messageId: 'codeLikeTemplate' }],
      },
      {
        code: 'const v = `a === b && c`',
        errors: [{ messageId: 'codeLikeTemplate' }],
      },
    ],
  },
)
