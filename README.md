[![CircleCI](https://img.shields.io/circleci/build/github/a6b8/continuousExporter/main)]()
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# Continuous Exporter
This module helps efficiently process continuous incoming data packets. And depending on the `type`, it sends with the corresponding method.

## Features:
- Integrated queue for different types of requests.
- Internal state management
- Sending data via `get` request as a webhook, `post` request with data as `body`, and `local` saving of data on the disk.
- Optionally passing modified headers for authentication through a `Bearer` token.

## Quickstart

```
npm i continuous-exporter
```
This example shows a minimal example that creates a route via `setRoutes` and then sends a request into the queue via `sendData` and then processes it.

```js
import { Exporter } from 'continuous-exporter'

const routes = [
    {
        'name': 'myRoute',
        'headers': { 'authentification': 'Bearer 123' },
        'requestType': 'get',
        'url': 'http://localhost:3000/get',
        'concurrentRequests': 5,
        'delayPerLoopInMs': 5000
    }
]

const exporter = new Exporter()
exporter.setRoutes( { routes } )
exporter.sendData( { 
    'routeName': 'myRoute', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )
```

## Table of Contents
- [Continuous Exporter](#continuous-exporter)
  - [Features:](#features)
  - [Quickstart](#quickstart)
  - [Table of Contents](#table-of-contents)
  - [Routes](#routes)
    - [Webhook (get)](#webhook-get)
    - [Post Request](#post-request)
    - [Local](#local)
  - [Methods](#methods)
    - [constructor()](#constructor)
    - [setRoutes()](#setroutes)
    - [sendData()](#senddata)
  - [DemoData](#demodata)
    - [getDemoDataUnsorted()](#getdemodataunsorted)
    - [getDemoDataSorted()](#getdemodatasorted)
    - [sendDemoData()](#senddemodata)
  - [License](#license)


## Routes

Initialization of routes is done via `setRoutes( { routes=[] })`. There are currently 3 different methods that can be used for sending:

1. `get` Webhook: Here, a URL is retrieved via a `get` request and the data is passed in the URL.
2. Post Request: Here, data is transferred in the `body` as a `jsonObject` via a `post` request.
3. `local`: Here, the data can be stored in a folder.

### Webhook (get)

This type allows small amounts of data to be transmitted as `get` requests. For this purpose, the data is appended as URL parameters. This is especially useful when `ping` needs to be passed to aggregators such as `make`.

> The passed data object is transformed into URL parameters. The possibility is not designed for complex and deep data structures.

**Parameters**

| key                | type    | description                                    | required | validation                                                                                                                    |
|--------------------|---------|------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------|
| `name`               | string  | The name of the route endpoint.               | yes      | This parameter specifies the name under which the route is managed. It can only contain letters from a-zA-Z, numbers from 0-9, and hyphens. If multiple routes are created, it is important to ensure that the names are unique, as data is categorized using this name via `sendData`. |
| `headers`            | object  | The header parameters for the request.        | no       | This parameter expects a valid key/value object. This parameter can also be used to pass a `Bearer` token if necessary. If no additional headers are needed, this parameter can be set to `{}` and will not be included. |
| `type`             | string  | The type of HTTP request (e.g., 'get', 'post').| yes     | The entry `'get'` selects the type "Webhook".                                                                               |
| `url`                | string  | The URL of the route endpoint.                | yes      | A valid URL must be provided here. For example: "http://localhost:3000/get"                                                  |
| `concurrentRequests` | number  | The number of concurrent requests.            | yes      | This value specifies how many concurrent requests can be made. For example; `5`                                             |
| `delayPerLoopInMs`          | number  | The delay between requests in milliseconds.   | yes      | This parameter defines the delay inserted between each loop. `concurrentRequests` can be used to specify how many requests are sent in one loop. |


**Example**

```js
...
const routes = [
    {
        'name': 'myName',
        'headers': { 'authentification': 'Bearer 123' },
        'requestType': 'get',
        'url': 'http://localhost:3000/get',
        'concurrentRequests': 5,
        'delayPerLoopInMs': 5000
    }
]
exporter.setRoutes( { routes } )
```


### Post Request

With the `post` request, larger amounts of data can be transmitted in the `body` as a `jsonObject`. This is especially useful when the data needs to be written to a dedicated server.

**Keys**
| key                | type    | description                                    | required          | example                  |
|--------------------|---------|------------------------------------------------|-------------------|--------------------------|
| name               | string  | The name of the route endpoint.               | yes               | This parameter specifies the name under which the route is managed. It can only contain letters from a-zA-Z, numbers from 0-9, and hyphens. If multiple routes are created, it is important to ensure that the names are unique, as data is categorized using this name via `sendData`.                      |
| headers            | object  | The header parameters for the request.        | yes               | { 'authentification': 'Bearer 123' } |
| type               | string  | The type of HTTP request (e.g., 'get', 'post').| yes             | "get"                    |
| url                | string  | The URL of the route endpoint.                | yes               | "http://localhost:3000/get" |
| concurrentRequests| number  | The number of concurrent requests.            | yes               | 5                        |
| delayPerLoopInMs          | number  | The delay between requests in milliseconds.   | yes               | 5000                     |

**Example**

```js
const routes = [ {
  'name': 'post',
  'headers': { 'authentification': 'Bearer abc' },
  'requestType': 'post',
  'url': 'http://localhost:3000/post',
  'concurrentRequests': 1,
} ]
```


### Local


**Keys**

| key                | type   

 | description                                    | required          | example                  |
|--------------------|---------|------------------------------------------------|-------------------|--------------------------|
| name               | string  | The name of the route endpoint.               | yes               | "local"                  |
| type               | string  | The type of the route (e.g., 'local').        | yes               | "local"                  |
| outFolder          | string  | The output folder for the local route.         | yes               | "/out"                   |
| fileName           | string  | The filename for the local output.             | yes               | "out.txt"                |
| concurrentRequests| number  | The number of concurrent requests.             | yes               | 3                        |
| delayPerLoopInMs          | number  | The delay between requests in milliseconds.    | yes               | 3000                     |


**Example**

```js
{
    'name': 'local',
    'requestType': 'local',
    'outFolder': '/out',
    'fileName': 'out.txt',
    'concurrentRequests': 3,
    'delayPerLoopInMs': 3000
}
```


## Methods

### constructor()
Description

**Method**
```js
.constructor( silent=false )
```

| Key                | Type     | Description                                       | Required |
|--------------------|----------|---------------------------------------------------|----------|
| silent        | array of strings    | Array of items. Example `[ '' ]` | Yes      |


**Example**
```js
true
```

**Returns**
```js
```


### setRoutes()
Description

**Method**
```js
.setRoutes( { routes, obj } )
```

| Key                | Type     | Description                                       | Required |
|--------------------|----------|---------------------------------------------------|----------|
| routes        |  |  | Yes      |


**Example**
```js
true
```

**Returns**
```js
```

### sendData()
Description

**Method**
```js
.sendData( { routeName, obj } )
```

| Key                | Type     | Description                                       | Required |
|--------------------|----------|---------------------------------------------------|----------|
| varName        |    |  | Yes      |


**Example**
```js
true
```

**Returns**
```js
```


## DemoData

To test the application, a data flow must be simulated. For this purpose, helper functions have been provided in the module that greatly simplify testing and experimentation. The individual functions build on each other.

- `getDemoDataUnsorted` creates data that returns an object divided into key/value pairs.  
- `getDemoDataSorted()` creates a flow of data from `getDemoDataUnsorted()` consisting of alternating chunks of data. 
- `sendDemoData()` asynchronously sends the data from `getDemoDataUnsorted()` to the `Exporter` module.



### getDemoDataUnsorted()

### getDemoDataSorted()

### sendDemoData()


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
