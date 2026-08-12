/**
 * @fileoverview
 * Flags template literals that contain code-like text but no `${...}`
 * interpolation. The classic mistake that bit the Stock In Hand report:
 *
 *   {qty === 0 ? '-' : `formatQty(item.qty, item.decimals, item.unit)`}
 *
 * React renders the backtick-wrapped text verbatim — including the literal
 * word "formatQty(...)" — instead of calling the function, because the author
 * forgot the `${}` interpolation markers (or wrapped a direct call in
 * backticks). This rule catches that by looking for template literals with
 * zero interpolations whose raw text still looks like a JavaScript
 * expression: a function call, member access, optional chaining, strict
 * equality, or a logical operator.
 */

// Signals are anchored to the START of the literal: the bug renders text that
// begins like a JS expression (`formatQty(`, `item.qty.`, `a === b`), whereas
// benign non-interpolated literals start with prose/CSS (`.print-title {`, `button,`,
// `space-y-2`, `user_roles`). Searching mid-string would flag CSS-in-JS blocks
// (`.class {`), pseudo-classes (`:not(`) and dotted selectors.
const CODE_LIKE_PATTERN =
  /^\s*[A-Za-z_$][\w$]*(?:\(|\?\.|\s*[=!]==|\s*&&|\s*\|\||\.\s*[A-Za-z_$])/

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow template literals containing code-like text without ${} interpolation',
    },
    messages: {
      codeLikeTemplate:
        'Template literal contains code-like text ("{{preview}}") but no `${...}` interpolation — it will render as literal text on screen. Use a direct expression or `${...}` instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      TemplateLiteral(node) {
        // Only literals with no interpolation are suspect.
        if (node.expressions.length > 0) {
          return
        }

        // Skip tagged templates such as String.raw`...` (Tailwind classes).
        const { parent } = node
        if (
          parent.type === 'TaggedTemplateExpression' &&
          parent.quasi === node
        ) {
          return
        }

        const text = node.quasis.map((quasi) => quasi.value.raw).join('')

        if (CODE_LIKE_PATTERN.test(text)) {
          context.report({
            node,
            messageId: 'codeLikeTemplate',
            data: {
              // Collapse newlines so multi-line literals don't spill across
              // multiple lines in the lint output.
              preview: text.trim().replace(/\s+/g, ' ').slice(0, 60),
            },
          })
        }
      },
    }
  },
}
