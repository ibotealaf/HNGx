## Sophomore Project

This is a REST API interfacing with non-relational database.

[UML & ER Diagram](https://drive.google.com/file/d/1UiW07mQSaOkww4g4DOvkqgS3F7nH6rUV/view)

## API Reference

#### Get all persons

```http
  GET /api/persons
```

#### Get a person

```http
  GET /api/person/${name}
```

| Parameter | Type     | Description                              |
| :-------- | :------- | :--------------------------------------- |
| `name`    | `string` | **Required**. Name of person to retrieve |

#### Create a person

```http
  POST /api/persons
```

| Body   | Type     | Description                            |
| :----- | :------- | :------------------------------------- |
| `name` | `string` | **Required**. Name of person to create |

#### Edit a person

```http
  PUT /api/persons/${name}
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `name`    | `string` | **Required**. Name of person to edit |

#### Get a person

```http
  DELETE /api/persons/${name}
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `name`    | `string` | **Required**. Name of person to remove |

## Installation

To run this project, you will need to have nodejs (>=18) installed

```bash
node -v
```

### 1. Create environment file

Copy .env.example to .env

Below is a description of these env vars:

```
MONGODB_URL=<mongodb URL for your mongodb install, e.g. mongodb://localhost:27017>
```

### 2. Run application

```bash
  yarn start
```
