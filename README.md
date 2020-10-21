# Generate unit tests for HTTP clients with fixugen

Generate unit tests with fixugen and mocks HTTP responses [nock](https://www.npmjs.com/package/nock). Useful for modules that export a Javascript interface for i.e. REST APIs.

Uses [fixugen's](https://www.npmjs.com/package/@natlibfi/fixugen) **useMetadataFile** so your fixture directories must contain **metadata.json** file.

# Usage
```js
import 'fetch' from 'node-fetch';asdsdasaasd
import {expect} from 'chai';
import generateTests from '@natlibfi/fixugen-http-client';

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures']
});

function callback({getFixture}) {
  // The base URL is always http://foo.bar
  const response = await fetch('http://foo.bar');
  expect(response.status).to.equal(200);
}
```
# Configuration
The following optional properties are supported in the factory function:
- **mocha**: Mocha options
- **fixura:** Fixura options
- **recurse**: Fixugen's *recurse* option. Defaults to **true**

## metadata.json
An array property **requests** must be present in **metadata.json** file. It supports the following properties:
- **status**: HTTP status code (Number). **Mandatory**.
- **method**: HTTP method in lowercase. **Mandatory**.
- **url**: URL of the request. This is only the location and parameters part of the actual URL. The base URL is always `http://foo.bar`. Must start with `/`. **Mandatory**.
- **requestHeaders**: An object representing requests headers.
- **responseHeaders**: An object representing response headers.

This configuration is also passed to the callback as the property **requests**.

## Request and response payloads
The fixture directory for each unit test can have request- and response payload fixtures which must match the following filename pattern:
`/^request[0-9]+`
`/^response[0-9]+`

Where `[0-9]+` denotes the index number of the fixture (Requests and responses are mocked in that order).

## License and copyright

Copyright (c) 2020 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Lesser General Public License Version 3** or any later version.
