# String Analysis API

A RESTful API for analyzing and managing text strings with advanced filtering capabilities, including natural language query support and stores their computed properties in memory.

## 🚀 Features

- **String Analysis**: Analyze strings for length, character frequency, word count, palindrome detection, and more
- **CRUD Operations**: Create, read, and delete string entries
- **Advanced Filtering**: Filter strings by multiple criteria (palindrome, length, word count, characters)
- **Natural Language Queries**: Use plain English to filter strings (e.g., "all single word palindromic strings")
- **SHA-256 Hashing**: Unique identification using cryptographic hashing
- **In-Memory Storage**: Fast data access with Map-based storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sherifdeji/hng-stage1-string-analyzer-api.git
   cd hng-stage1-string-analyzer-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### 1. Create String Analysis

**POST** `/strings`

Analyzes a string and stores it in the system.

**Example Request Body:**

```json
{
  "value": "racecar"
}
```

**Success Response (201 Created):**

```json
{
  "id": "sha256_hash",
  "value": "racecar",
  "properties": {
    "length": 7,
    "isPalindrome": true,
    "wordCount": 1,
    "charFrequencyMap": {
      "r": 2,
      "a": 2,
      "c": 2,
      "e": 1
    },
    "sha256Hash": "sha256_hash"
  },
  "created_at": "2025-10-22T10:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Missing "value" field
- `422 Unprocessable Entity`: Invalid data type (contains digits)
- `409 Conflict`: String already exists

---

### 2. Get Specific String

**GET** `/strings/{string_value}`

Retrieves a specific string by its value.

**Example:**

```
GET /strings/racecar
```

**Success Response (200 OK):**

```json
{
  "id": "sha256_hash",
  "value": "racecar",
  "properties": {
    /* ... */
  },
  "created_at": "2025-10-22T10:00:00Z"
}
```

**Error Response:**

- `404 Not Found`: String does not exist

---

### 3. Get All Strings (with Filtering)

**GET** `/strings`

Retrieves all strings with optional filtering.

**Query Parameters:**

- `is_palindrome` (boolean): `true` or `false`
- `min_length` (integer): Minimum string length
- `max_length` (integer): Maximum string length
- `word_count` (integer): Number of words
- `contains_character` (string): Single character (a-z)

**Examples:**

```
GET /strings?is_palindrome=true
GET /strings?min_length=5&max_length=10
GET /strings?word_count=1&contains_character=a
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": {
        /* ... */
      },
      "created_at": "2025-10-22T10:00:00Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true
  }
}
```

**Error Response:**

- `400 Bad Request`: Invalid query parameter values or types

---

### 4. Natural Language Filtering

**GET** `/strings/filter-by-natural-language?query={your_query}`

Filter strings using natural language queries.

**Supported Queries:**

- `"all single word palindromic strings"` → `word_count=1`, `is_palindrome=true`
- `"strings longer than 10 characters"` → `min_length=11`
- `"strings containing the letter z"` → `contains_character=z`
- `"palindromic strings that contain the first vowel"` → `is_palindrome=true`, `contains_character=a`

**Example:**

```
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Success Response (200 OK):**

```json
{
  "data": [
    /* array of matching strings */
  ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Unable to parse query
- `422 Unprocessable Entity`: Query has conflicting filters

---

### 5. Delete String

**DELETE** `/strings/{string_value}`

Deletes a string from the system.

**Example:**

```
DELETE /strings/racecar
```

**Success Response:**

- `204 No Content` (empty response body)

**Error Response:**

- `404 Not Found`: String does not exist

---

## 🔥 Usage Examples

### Using cURL

```bash
# Create a string
curl -X POST http://localhost:3000/api/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"racecar"}'

# Get a specific string
curl http://localhost:3000/api/strings/racecar

# Get all palindromes
curl "http://localhost:3000/api/strings?is_palindrome=true"

# Natural language query
curl "http://localhost:3000/api/strings/filter-by-natural-language?query=all%20palindromic%20strings"

# Delete a string
curl -X DELETE http://localhost:3000/api/strings/racecar
```

---

## 🗂️ Project Structure

```
hng-stage1/
├── src/
│   ├── controllers/
│   │   └── stringController.ts    # Route handlers
│   ├── routes/
│   │   └── stringRoutes.ts        # API routes
│   ├── utils/
│   │   ├── storage.ts             # In-memory data store
│   │   ├── stringAnalyzer.ts     # String analysis logic
│   │   ├── naturalLanguageParser.ts # NL query parser
│   │   └── types.ts               # TypeScript types
│   └── index.ts                   # Express app entry point
├── .env                           # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🔧 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Crypto** - SHA-256 hashing

---

## 📝 Error Codes Summary

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created successfully                     |
| 204  | Deleted successfully (no content)        |
| 400  | Bad request (invalid input)              |
| 404  | Resource not found                       |
| 409  | Conflict (duplicate entry)               |
| 422  | Unprocessable entity (invalid data type) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚠️ Important Notes

### Data Persistence

This API uses **in-memory storage** solution, which means:

- ✅ Fast read/write operations
- ✅ No database setup required
- ⚠️ **Data is lost when the server restarts**
- ⚠️ Not suitable for production use with persistent data requirements

**What this means:** All data, including all analyzed strings and their properties, is stored in the application's RAM. This data is **volatile** and will be **permanently lost** every time the server restarts, crashes, or is redeployed.
**For production environments**, consider migrating to a persistent database like PostgreSQL or MongoDB.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sherif Ibrahim**

---

## 🙏 Acknowledgments

- Built as part of Stage 1 assessment for [HNG Internship](https://hng.tech)

---
