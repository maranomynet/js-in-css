import o from 'ospec';

import {
  DestinationOpts,
  getCommonPath,
  InOutMap,
  resolveOutputFiles,
} from './resolveOutputFiles';

o.spec('getCommonPath', () => {
  const tests = [
    {
      input: ['__tests/css/styles/test.css.js', '__tests/css/styles/sub/test2.css.js'],
      expected: '__tests/css/styles/',
    },

    {
      input: ['some/path/foo.css.js', 'other/path/foo.css.js'],
      expected: '',
    },

    {
      input: ['__tests/css/styles/foo/test.css.js', '__tests/css/sub/foo/test2.css.js'],
      expected: '__tests/css/',
    },
  ];

  o('works', () => {
    tests.forEach(({ input, expected }) => {
      o(getCommonPath(input)).equals(expected);
    });
  });
});

o.spec('resolveOutputFiles', () => {
  type Test = {
    input: Array<string>;
    options: Array<DestinationOpts>;
    expected: Array<InOutMap>;
  };

  const tests: Array<Test> = [
    {
      input: [
        '__tests/css/styles/test.css.js',
        '__tests/css/styles/sub/test2.css.js',
        '__tests/css/styles/sub/test3.js',
        '__tests/css/styles/sub/test4',
      ],
      options: [{}, { outdir: '' }],
      expected: [
        {
          inFile: '__tests/css/styles/test.css.js',
          outFile: '__tests/css/styles/test.css',
        },
        {
          inFile: '__tests/css/styles/sub/test2.css.js',
          outFile: '__tests/css/styles/sub/test2.css',
        },
        {
          inFile: '__tests/css/styles/sub/test3.js',
          outFile: '__tests/css/styles/sub/test3.css',
        },
        {
          inFile: '__tests/css/styles/sub/test4',
          outFile: '__tests/css/styles/sub/test4.css',
        },
      ],
    },

    {
      input: ['test2/css/styles/test.css.js', 'test2/css/styles/sub/test2.css.js'],
      options: [
        { outdir: 'output' },
        { outdir: 'output/' },
        { outdir: './output/../output/' },
      ],
      expected: [
        {
          inFile: 'test2/css/styles/test.css.js',
          outFile: 'output/test.css',
        },
        {
          inFile: 'test2/css/styles/sub/test2.css.js',
          outFile: 'output/sub/test2.css',
        },
      ],
    },

    {
      input: ['test3/css/styles/test.css.js', 'test3/css/styles/sub/test2.css.js'],
      options: [{ outdir: './' }, { outdir: '.' }],
      expected: [
        {
          inFile: 'test3/css/styles/test.css.js',
          outFile: './test.css',
        },
        {
          inFile: 'test3/css/styles/sub/test2.css.js',
          outFile: './sub/test2.css',
        },
      ],
    },
    // Example 1 from README.md
    {
      input: [
        'src/css/styles.css.js',
        'src/css/resets.js',
        'src/css/component/buttons.css.js',
        'src/css/component/formFields.js',
      ],
      options: [{ outdir: 'dist/styles' }],
      expected: [
        {
          inFile: 'src/css/styles.css.js',
          outFile: 'dist/styles/styles.css',
        },
        {
          inFile: 'src/css/resets.js',
          outFile: 'dist/styles/resets.css',
        },
        {
          inFile: 'src/css/component/buttons.css.js',
          outFile: 'dist/styles/component/buttons.css',
        },
        {
          inFile: 'src/css/component/formFields.js',
          outFile: 'dist/styles/component/formFields.css',
        },
      ],
    },
    // Example 2 from README.md
    {
      input: [
        'src/skin/css/styles.css.js',
        'src/skin/css/resets.js',
        'src/skin/css/component/buttons.css.js',
        'src/skin/css/component/formFields.js',
      ],
      options: [{ outdir: 'dist/styles', outbase: './src/skin' }],
      expected: [
        {
          inFile: 'src/skin/css/styles.css.js',
          outFile: 'dist/styles/css/styles.css',
        },
        {
          inFile: 'src/skin/css/resets.js',
          outFile: 'dist/styles/css/resets.css',
        },
        {
          inFile: 'src/skin/css/component/buttons.css.js',
          outFile: 'dist/styles/css/component/buttons.css',
        },
        {
          inFile: 'src/skin/css/component/formFields.js',
          outFile: 'dist/styles/css/component/formFields.css',
        },
      ],
    },
    // TODO: Test outbase more thoroughly
  ];

  o('works', () => {
    tests.forEach(({ input, options, expected }) => {
      options.forEach((opts) => {
        o(resolveOutputFiles(input, opts)).deepEquals(expected);
      });
    });
  });
});
