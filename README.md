[![CircleCI](https://img.shields.io/circleci/build/github/a6b8/dataExporter/main)]() ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# Continuous Exporter
This module helps efficiently process continuous incoming data packets. And depending on the `type`, it sends with the corresponding method.

## Features:
- Continuous processing of packets.
- Efficient separation of initialization and sending.


## Quickstart

```
npm i continuous-exporter
```
Diese Beispiel erstellt über `sendDemoData()`

```js
```


## Table of Contents
- [Continuous Exporter](#continuous-exporter)
  - [Features:](#features)
  - [Quickstart](#quickstart)
  - [Table of Contents](#table-of-contents)
  - [Routes](#routes)
    - [Get](#get)
    - [Post](#post)
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

### Get

### Post

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