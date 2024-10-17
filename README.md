# Decentralized Registry Package Manager

<img src="/assets/img/animal/wolf.webp" height=250 width=250 />

Decentralized Registry Package Manager - npm for the DWeb. Publish a Decentralized Package to your Decentralized Web Node using DRPM!

## Table of Contents

- [Vocabulary](#vocabulary)
  - [Web5 Vocab](#web5-vocab)
  - [DRPM Vocab](#drpm-vocab)
  - [Other Vocab](#other-vocab)
- [Summary](#summary)
- [Monorepo](#monorepo)
- [Namespace](#namespace)
- [Decentralized Package Import](#decentralized-package-import)
- [Register Hooks](#register-hooks)
- [CLI](#cli)
- [Dependencies](#dependencies)
- [Project Resources](#project-resources)

## Vocabulary

Acronyms galore! But what does it all mean!?

### Web5 Vocab

- DID = Decentralized Identifier
- DWN = Decentralized Web Node
- DWA = Decentralized Web App

### DRPM Vocab

- DRG = Decentralized Registry
- DPK = Decentralized Package
- DPM = Decentralized Package Manager
- DRPM = Decentralized Registry Package Manager
- DMI = Decentralized Module Import
- DPI = Decentralized Package Import (alt name for DMI)

### Other Vocab

- NPK = Node Package
- NPM = Node Package Manager

## Summary

DRPM is a set of tools using DIDs to publish, install, and interact with DPKs published to a DWN. Every DID created has a DID Document containing relevant information for how to interact with that DID. In the case of DRPM, we are leveraging the `serverhe DID listed against the DPK to lookup the DID document using the DID method (which defines where the DID doc was stored, i.e.  which decentralized storage network). DRPM support two DID methods: DHT and WEB. The DID doc contains a "server" key containing as its value a list of objects. Each object defines a service available to that DID. In the case of DRPM, the service used is the DecentralizedWebNode service. This service object will contain a DWN endpoint. This endpoint is used to query the DWN for the DPK in question, which is stored using the DRPM DWN protocol. To view the protocol rules, checkout out [drpm.tools/protocols/drpm](https://drpm.tools/protocols/drpm).

The goal of DRPM is to decentralize package management putting control of the software in the hands of the users - not the manager. This ensures reliability by eliminating the possibility for broken links. With DRPM, publishers write code to their DWNs and list it on [explorer.drpm.tools](https://explorer.drpm.tools).

Developers can discover packages here just like npmjs.com, except explorer.drpm.sofware does not store the code, only offers publishers the ability to list it for discovery. The publishers store the code in their own DWNs and users can query, download and keep a copy of that code as immutable an source in their own DWN. This forever eliminates the possiblity for brokens links or censorship.

Npmjs packages are published under usernames or organization names. Devs can publish packages directly to npmjs under the package name and organizations can have an organization username (such as `@web5`) with a list of packages that under that org name. This paradigm is well known and understood but has a limited namespace resulting in gatekeeping, sniping or squatting.

## Namespace

- NPM User [npmjs.com/~bnonni](https://npmjs.com/~bnonni)
- NPM Organization: [npmjs.com/org/web5](https://npmjs.com/org/web5)
- NPM Package: [npmjs.com/package/tool5](npmjs.com/package/tool5)

In DRPM, packages are published to DWNs referenced by DIDs. Any entity can have a DID: user, org, device, etc. This unlimits the namespace and eliminates gatekeeping and censorship. DRPM supports DHT method DIDs (for now). DOM resolves `did:dht` to the did document on the Mainline DHT network, which lists the dwn endpoints, and makes fetch requests to the DWN using the DMI to build DWN query URL.

- DRPM User [did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo](https://nonni.org/.well-known/did)
- DRPM Organization [did:web:drpm.tools](https://drpm.tools/.well-known/did)
- DRPM Package [http://@drg/did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo^5.0.0](http://nonni.org/did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo/query?filter.tags.name=tool5&filter.tags.version=1.1.2)

<!-- ## Monorepo

This monorepo contains 4 different developer tools; each providing distinct and important functionality:

- [/packages/dpm](/packages/dpm/README.md) = an easy-to use CLI for performing certain actions that fall outside the capabilities of npm
- [/packages/dpk](/packages/dpk/README.md) = core primitive providing the ability to install and manage DPKs, use DPIs & build and publish DPKs
- [/packages/drg](/packages/drg/README.md) = new primitive to leverage dpk by running a local DRG for interacting with DIDs, DWNs & DPKs
- [/packages/common](/packages/common/README.md) = a library of utilities used by dpm, dpk and drg -->

## Decentralized Package Import

- DPIs are used to import code from locally installed DPKs

```ts
import express from '@drg/express';
const express = require('@drg/express');
```

## Register Hooks

The DRPM register hooks paradigm can be used to run one-off scripts without downloading the DPK into the `node_modules` folder. Check out [hooks.ts](/lib/hooks.ts) and [register.ts](/lib/register.ts)

```shell
npm run build
node --import ./dist/esm/src/register.js ./path/to/your/script.js
```

## CLI

TODO

## Dependencies

DRPM reuses the `package.json` and `package-lock.json` files for easy integration to the normal `npm` dev env. The same principals apply: the entries in each file ensure version locking and integrity hashing. This approach guarantees that packages are always accessible and versioned securely, enabling a more resilient and trustworthy ecosystem for software distribution

- DRPM intercepts `npm install` and redirects the GET calls to a registry running on `localhost:2092`
- This registry is a simple express server mimicing the paths used by npm to `GET` pacakges from `registry.npmjs.org`
- The express server parses API url path to construct a DRL (Decentralized Resource Locator)
- DRPM requests the DPK from the DWN found in the DID doc assocaigted with the DID from the dependency version string
- The registry server installs the DPK metadata and tarball into a local folder called `.registry` and passes the path to the tarball back to the `npm install` cli call
- From there, `npm` handles the rest normally installing the tarball into `node_modules` under `@drg/{packageName}/{version}`
- Integrity hashes are produced using the DPK.tgz content ensuring the publisher cannot swap out code under a specific verion in the protocol path.
- Additionally, DRPM allows developers to republish the code pulled from the remote DWN to their own DWN forever allowing them to secure an immutable copy
- Once a release is published and copied to your own DWN, it can only be changed by the DWN owner.
- To see the custom registry server, check out [/src/registry/index.ts](/src/registry/index.ts)
- See below for examples entries in `package.json` and `package-lock.json`

```json
// package-lock.json example
{
    "dependencies": {
        "@drg/express": "http://@drg/express/did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo^4.21.1"
    }
}
```

```json
// package-lock.json example
{
    "@drg/express": {
        "version": "0.1.0",
        "resolved": "http://@drg/express/did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo^4.21.1",
        "integrity": "sha512-x/AIjFIKRllrhcb48dqUNAAZl0ig9+qMuN91RpZo3Cb2+zuibfh+KISl6+kVVyktDz230JKc208UkQwwMqyB+w==/VNCYsUA==",
        "license": "Apache-2.0"
    }
}
```

## Project Resources

| Resource                                   | Description                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                   |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues     |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                             |
| [LICENSE](./LICENSE)                       | [![Apache License 2.0][apache-license-badge]][apache-license-link]            |

[apache-license-badge]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[apache-license-link]: https://opensource.org/licenses/Apache-2.0
