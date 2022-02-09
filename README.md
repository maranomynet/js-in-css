**Concept work in progress. Very little actual code here yet.**

---

# js-in-css

This library serves much of the same purpose as SASS/SCSS, LESS and other CSS
preprocessors, but uses plain JavaScript/TypeScript to provide the
"programmability" of local variables, mixins, utility functions, etc. etc.

Overall this is a "do less" toolkit with tiny API, that mainly tries to stay
out of your way.

Selector nesting and autoprefixer features are automoatically provided by
`postCSS`, but apart from that it's all pretty basic. Just you composing CSS.

For good developer experience, it'd be best to use VSCode with the
[**vscode-styled-components** extension](https://marketplace.visualstudio.com/items?itemName=stmponents.vscode-stmponents)
for instant syntax highlighting and IntelliSense autocomplete inside the CSS
template literals.

## Quick-Start Guide

```sh
yarn add --dev js-in-css
```

Create a file called `src/cool-design.css.js`:

```ts
import { css, variables, px } from 'js-in-css';

const colors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};

const bp = { large: 850 };
const mq = {
  small: `screen and (max-width: ${px(bp.large - 1)})`
  large: `screen and (min-width: ${px(bp.large)})`
};

const cssVars = variables({
  linkColor: colors.red,
  'linkColor--hover': colors.purple, // dashes must be quoted
  linkColor__focus: `var(--focusColor)`;
  focusColor: `peach`;
});
const vars = cssVars.vars;

export default css`
  :root {
    ${cssVars.declarations}
  }

  a[href] {
    color: ${vars.linkColor};
    unknown-property: is ok;

    &:hover {
      color: ${vars['linkColor--hover']};
    }
    &:focus-visible {
      color: ${vars.linkColor__focus};
    }
  }

  @media ${mq.large} {
    html {
      background-color: ${colors.yellow};
    }
  }
`
```

Then build the CSS file with the command:

```sh
./node_modules/.bin/js-in-css src/*.css.js --dest dist/styles
```

Now you have a file called `dest/styles/cool-design.css`:

```css
:root {
  --linkColor: #cc3300;
  --linkColor--hover: #990099;
  --linkColor__focus: var(--focusColor);
  --focusColor: peach;
}
a[href] {
  color: var(--linkColor);
  unknown-property: is ok;
}
a[href]:hover {
  color: var(--linkColor--hover);
}
a[href]:focus-visible {
  color: var(--linkColor__focus);
}
@media screen and (min-width: 850px) {
  html {
    background-color: yellow;
  }
}
```

## Features

The `js-in-css` module exports the following methods:

### ` css``  `

Dumb tagged template literal that returns a `string`.

```ts
import { css } from 'js-in-css';

const themeColors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};
const textColor = `#333`;

export default css`
  body {
    color: ${textColor};
  }

  ${Object.entries(themeColors).map(
    (color) => css`
      body.theme--${color.name} {
        background-color: ${color.value};
      }
    `
  )}
`;
```

### `variables<T extends string>(vars: Record<T, string>): VariableData<T>`

`VariableData<T>.declarations` contains CSS string with all the custom
property declarations, ready to be dumped into a CSS rule block.

`VariableData<T>.vars` is a readonly `Record<T, string>` object with the full
variable names wrapped in `var()` ready to be used as values.

```ts
import { variables } from 'js-in-css';

const cssVars = variables({
  linkColor: `#0000ff`,
  linkColor__hover: `#cc00cc`,
});

cssVars.declarations;
/*`
  --linkColor: #0000ff;
  --linkColor__hover: #cc00cc;
`*/

cssVars.vars.linkColor;
// `var(--linkColor)`
cssVars.vars.linkColor__hover;
// `var(--linkColor__hover)`
```

### `scoped(prefix?: string): string`

Returns a randomized/unique string token, with an optional `prefix`. These
tokens can be using for naming `@keyframes` or for mangled class-names, if
that's what you need:

```ts
import { scoped, css } from 'js-in-css';

export const blockName = scoped(`.Button`); // 'Button_4af51c0d267'

export default css`
  .${blockName} {
    border: 1px solid blue;
  }
  .${blockName}__title {
    font-size: 2rem;
  }
`;
/*`
  .Button_4af51c0d267 {
    border: 1px solid blue;
  }
  .Button_4af51c0d267__title {
    font-size: 2rem;
  }
`*/
```

### Unit functions

**Fixed sizes:** `px()` and `cm()`

**Type relative:** `em()`, `rem()`, `ch()` and `ex()`

**Layout relative:** `pct()` (%), `vh()`, `vw()`, `vmin()` and `vmax()`

**Time:** `ms()`

These return light-weight object instances that can still be mostly treated as
string **and** number liters depending on the context.

```ts
import { px, css } from 'js-in-css';

const leftColW = px(300);
const mainColW = px(700);
const gutter = px(50);
// Calculations work as if they're numbers
const totalWidth = px(leftColW + gutter + mainColW);

export default css`
  .layout {
    /* But the unit suffix appears when printed */
    width: ${totalWidth};
    margin: 0 auto;
    display: flex;
    gap: ${gutter};
  }
  .main {
    width: ${mainColW};
  }
  .sidebar {
    width: ${leftColW};
  }
`;
/*`
  .layout {
    width: 1050px;
    margin: 0 auto;
    display: flex;
    gap: 50px;
  }
  .main {
    width: 700px;
  }
  .sidebar {
    width: 300px;
  }
`*/
```

### Unit converters

100-based percentage values from proportions/fractions:  
`pct_f()`, `vh_f()`, `vw_f()`, `vmin_f()` and `vmax_f()`.

```js
pct_f(1 / 3); // 33.33333%   (Same as `pct(100 * 1/3)`)
vw_f(370 / 1400); // 26.42857143vw
```

Milliseconds from seconds:  
`ms_sec()`

```js
ms_sec(1.2); // 1200ms
```

Centimeters from other physical units:  
`cm_in()`, `cm_mm()`, `cm_pt()` and `cm_pc()`.

```js
cm_mm(33.3); // 3.33cm
cm_in(1); // 2.54cm
```

## Roadmap

- Make css minification optional
- Add more helpful methods, including color functions, unit values, etc.
- Expose a JavaScript build API

### Maybe:

- `--watch` mode … although this might also be defined as out of scope
- Ability to configure and/or chain more postcss plugins.

### Not planned:

- Emitting source maps.
- Complicated config files, etc.
