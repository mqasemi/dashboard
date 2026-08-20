import { propertyGroups } from 'stylelint-config-clean-order';

const propertiesOrder = propertyGroups.map(properties => ({
  noEmptyLineBetween: true,
  emptyLineBefore: 'never',
  properties
}));

export default {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss-less',
  plugins: ['stylelint-order', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'function-no-unknown': null,
    'no-descending-specificity': null,
    // The codebase (and @delon/ng-zorro, whose classes we override) is BEM: `block__element--modifier`.
    // The standard config's kebab-case default rejects `__` and `--`, so widen it to BEM instead of
    // sprinkling disable comments over every override.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      { message: selector => `Expected class selector "${selector}" to be kebab-case or BEM` }
    ],
    'plugin/declaration-block-no-ignored-properties': true,
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['/^g2-/', '/^nz-/', '/^app-/']
      }
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['ng-deep']
      }
    ],
    'import-notation': 'string',
    'media-feature-range-notation': 'prefix',
    'media-query-no-invalid': null,
    'declaration-property-value-no-unknown': null,
    'order/order': [
      [
        'dollar-variables',
        'at-variables',
        'custom-properties',
        { type: 'at-rule', name: 'custom-media' },
        { type: 'at-rule', name: 'function' },
        { type: 'at-rule', name: 'mixin' },
        { type: 'at-rule', name: 'extend' },
        { type: 'at-rule', name: 'include' },
        'declarations',
        'less-mixins',
        {
          type: 'rule',
          selector: /^&::[\w-]+/,
          hasBlock: true
        },
        'rules',
        { type: 'at-rule', name: 'media', hasBlock: true }
      ],
      { severity: 'warning' }
    ],
    'order/properties-order': [
      propertiesOrder,
      {
        severity: 'warning',
        unspecified: 'bottomAlphabetical'
      }
    ]
  },
  ignoreFiles: ['src/assets/**/*']
};
