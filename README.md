[![CircleCI](https://img.shields.io/circleci/build/github/a6b8/continuousExporter/main)]()
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# Continuous Exporter


## Features:


## Quickstart

```
npm i continuous-exporter
```


```js


```

## Table of Contents
- [Continuous Exporter](#continuous-exporter)
  - [Features:](#features)
  - [Quickstart](#quickstart)
  - [Table of Contents](#table-of-contents)
  - [Routes](#routes)
    - [Webhook (get)](#webhook-get)
    - [Post Request](#post-request)
    - [File](#file)
  - [Methods](#methods)
    - [constructor()](#constructor)
    - [setRoutes()](#setroutes)
    - [sendData()](#senddata)
    - [getConfig()](#getconfig)
    - [setConfig()](#setconfig)
    - [printRouteStatus()](#printroutestatus)
  - [Events](#events)
    - [exporterRouteStatus](#exporterroutestatus)
    - [exporterRouteLoopUpdate](#exporterrouteloopupdate)
  - [DemoData](#demodata)
    - [getDemoDataUnsorted()](#getdemodataunsorted)
    - [getDemoDataSorted()](#getdemodatasorted)
    - [sendDemoData()](#senddemodata)
  - [License](#license)


## Routes

Initialization of routes is done via `setRoutes( { routes=[] })`. There are currently 3 different `routeTypes` that can be used for sending:

1. `get` Webhook: Here, a URL is retrieved via a `get` request and the data is passed in the URL.
2. `post` Request: Here, data is transferred in the `body` as a `jsonObject` via a `post` request.
3. `file`: Here, the data can be stored in a folder.

### Webhook (get)

This type allows small amounts of data to be transmitted as `get` requests. For this purpose, the data is appended as URL parameters. This is especially useful when `ping` needs to be passed to aggregators such as `make`.

> The passed data object is transformed into URL parameters. The possibility is not designed for complex and deep data structures.

**Parameters**

| key                | type    | description                                    | required | validation                                                                                                                    |
|--------------------|---------|------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------|
| `routeId`               | string  | The name of the route endpoint.               | yes      | This parameter specifies the name under which the route is managed. It can only contain letters from a-zA-Z, numbers from 0-9, and hyphens. If multiple routes are created, it is important to ensure that the names are unique, as data is categorized using this name via `sendData`. |
| `routeType`             | string  | The type of HTTP request (e.g., 'get', 'post').| yes     | The entry `'get'` selects the type "Webhook".                                                                               |
| `requestHeaders`            | object  | The header parameters for the request.        | no       | This parameter expects a valid key/value object. This parameter can also be used to pass a `Bearer` token if necessary. If no additional headers are needed, this parameter can be set to `{}` and will not be included. |
| `requestUrl`                | string  | The URL of the route endpoint.                | yes      | A valid URL must be provided here. For example: "http://localhost:3000/get"                                                  |
| `concurrentRequests` | number  | The number of concurrent requests.            | yes      | This value specifies how many concurrent requests can be made. For example; `5`                                             |
| `delayPerLoopInMs`          | number  | The delay between requests in milliseconds.   | yes      | This parameter defines the delay inserted between each loop. `concurrentRequests` can be used to specify how many requests are sent in one loop. |


**Example**

```js
...
const routes = [
    {
        'routeId': 'myName',
        'routeType': 'get',
        'requestUrl': 'http://localhost:3000/get',
        'requestHeaders': { 'authentification': 'Bearer 123' },
        'concurrentRequestsPerLoop': 5,
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
| requestUrl                | string  | The URL of the route endpoint.                | yes               | "http://localhost:3000/get" |
| concurrentRequests| number  | The number of concurrent requests.            | yes               | 5                        |
| delayPerLoopInMs          | number  | The delay between requests in milliseconds.   | yes               | 5000                     |

**Example**

```js
const routes = [ {
  'routeId': 'post',
  'requestHeaders': { 'authentification': 'Bearer abc' },
  'routeType': 'post',
  'requestUrl': 'http://localhost:3000/post',
  'concurrentRequestsPerLoop': 1,
  'delayPerLoopInMs': 1000
} ]
```


### File


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
    'routeId': 'local',
    'routeType': 'local',
    'destinationFolder': '/out',
    'destinationFileName': 'out.txt',
    'concurrentRequestsPerLoop': 3,
    'delayPerLoopInMs': 3000
}
```


## Methods

### constructor()

### setRoutes()

### sendData()

### getConfig()

### setConfig()

### printRouteStatus()


## Events

### exporterRouteStatus

### exporterRouteLoopUpdate


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
