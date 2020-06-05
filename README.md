# Generate unit tests for HTTP clients with fixugen

[Mocha](https://mochajs.org/) is used a unit testing framework. Invoke fixugen in a .spec file with Mocha environment injected as usual.

Provides test callbacks with [Fixura's](https://www.npmjs.com/package/@natlibfi/fixura) functions to fetch test fixtures.

## Usage
The test fixture directory is parsed as follows: Each subdirectory becomes a unit test group (Mocha's `describe`) and inner subdirectories each represent individual tests (Mocha's `it`).

```js
import generateTests from '@natlibfi/fixugen';

generateTests({
  path: [__dirname, '..', 'test-fixtures'],
  callback: ({getFixture}) => {
    const expectedValue = getFixture('value.txt');
    const value = generateSomething();
    expect(value).to.equal(expectedValue);
  }
});
```

### Options
- **callback**: A callback function passed to Mocha's `it`. Receives Fixura's function as arguments.
- **path**: An array of path components which make up a path to the test fixtures directory
- **fixuraOptions**: Options that are passed to Fixura.
- **useMetadataFile**: If set to true, reads and parses a file named `metadata.json` in each unit test directory. The content must be a JSON object and it's properties as passed to the unit test callback function. If a property `description` is present, it is used as the test's description. Defaults to *false*.
- **mocha**: An object which maps the following properties to Mocha's corresponding callbacks: **after**, **before**, **afterEach**, **beforeEach**-

## License and copyright

Copyright (c) 2020 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Lesser General Public License Version 3** or any later version.