# Headless Browsing with Lambda

There are some considerations when working with Puppeteer on AWS Lambda...
- Lambda limits deployment package sizes up to ~50MB and docker images up to ~10GB.
- Using a docker image allows for control over which browser is used, ie google chrome over chromium.
- The docker image can take considerable time to build and upload when installing puppeteer (+ system dependencies) and google-chrome or chromium (+ system dependencies), slowing down development and deployment time. A base image should probably be used due to the infrequency of these libraries being updated.
- Chromium currently does not provide arm64 binaries for Linux. ([Issue#7740](https://github.com/puppeteer/puppeteer/issues/7740))
- Puppeteer is unreliable and unstable as it is, but proves extra difficult when confguring for multi-arch.

[As per Puppeteer recommendations for Lambda](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-aws-lambda)
- [@sparticuz/chromium](https://github.com/sparticuz/chromium)
    - A vendor and framework agnostic library that supports modern versions of chromium
    - Can be used with newer versions of puppeteer.
    - Does not support arm64
    - Using this library with `puppeteer-core` ensures the lambda is the smallest size out of all set ups, reducing cold-start times.
    - Locally `puppeteer` is used under devDepencencies and uses Google Chrome on the laptop (Mac M1)

## Info 

This handles deployment for a public http api with integrated lambda, the lambda has puppeteer and chromium installed for headless browsing. On a GET http request, a response of a screenshot of google homepage is returned.


## Usage 

### Credentials:
```bash
export AWS_PROFILE=<profile_name>
```

### Install Dependencies:

```bash
yarn run install
```

### Local:

```bash
yarn run invoke
```

### Deploy:

```bash
yarn run deploy
```

### Remove:

```bash
yarn run remove
```
