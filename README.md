[![CircleCI](https://img.shields.io/circleci/build/github/a6b8/continuousExporter/main)]() ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# Continuous Exporter
This module helps efficiently process continuous incoming data packets. And depending on the `type`, it sends with the corresponding method.

## Features:
- Integrieerte Warteschleife für die verschiedene Request arten.
- Internes Statemanagement
- Versenden von Daten per `get` Request als sogenannten Webhook, `post` Request mit Daten als `body`. Und `local` lokales abspeichern der Daten üauf der Festplatte.
- Optionales übergeben von modifizierten Headers zur Authentifizierung durch eine `Bearer` Token.

## Quickstart

```
npm i continuous-exporter
```
Diese Beispiel erstellt zeigt eine minimales Beispiel was über `setRoutes` eine Route erstellt und dann über `sendData` eine Request in die Warteschlange schickt und dann abarbeitet.

```js
import { Exporter } from 'continuous-exporter'

const routes = [
    {
        'name': 'myRoute',
        'headers': { 'authentification': 'Bearer 123' },
        'type': 'get',
        'url': 'http://localhost:3000/get',
        'concurrentRequests': 5,
        'delayInMs': 5000
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

Die initialisierung von Routes erfolgt über `setRoutes( { routes=[] })`. Es gibt zur Zeit 3 verschiedene Methoden die zum versenden genutzt werden können:

1. Webhook: Hier wird über einen `get` Request eine URL abgerufen und die Daten in der URL übergeben.
1. Post Request: Hier wurd über einen `post` Request die Daten als json object als `body` angehängt.
1. Local: Hier können die Daten in eine Folder abgelegt werden.

### Webhook (get)

### Post Request

### Local


## Methods

### constructor()


### setRoutes()

### sendData()


## DemoData

Um die Anwendung zu testen muss ein Datenfluss simuliert werden. Hierfür wurde in dem Modul hilfsfunktionen hinterlegt die das testen und ausprobieren stark vereinfachen. Die einzelnen Funktionen bauen hierbei aufeinander auf. 

- `getDemoDataUnsorted` erstellt Daten die ein Object zurückgeben, das in key/value pairs unterteilt ist.  
- `getDemoDataSorted()` erstellt aus den Daten `getDemoDataUnsorted()` eine Fluss an hintereinander abwechselnden Chunks von Daten. 
- `sendDemoData()` sendet die Daten von `getDemoDataUnsorted()` asynchron an das `Exporter` Modul



### getDemoDataUnsorted()

### getDemoDataSorted()

### sendDemoData()


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.