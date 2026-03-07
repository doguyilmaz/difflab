import type { Format } from "@/types";

export interface Sample {
  id: string;
  label: string;
  description: string;
  format: Format;
  left: string;
  right: string;
}

export const samples: Sample[] = [
  {
    id: "api-response",
    label: "API Response",
    description: "Two API responses with added, removed, and changed fields",
    format: "json",
    left: JSON.stringify(
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        settings: {
          theme: "dark",
          notifications: true,
          language: "en",
        },
        createdAt: "2024-01-15T08:00:00Z",
        lastLogin: "2024-03-01T14:30:00Z",
      },
      null,
      2,
    ),
    right: JSON.stringify(
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@company.com",
        avatar: "https://example.com/avatar.jpg",
        settings: {
          theme: "light",
          notifications: true,
          language: "en",
          beta: true,
        },
        createdAt: "2024-01-15T08:00:00Z",
        lastLogin: "2024-03-07T09:15:00Z",
        updatedAt: "2024-03-07T09:15:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "package-json",
    label: "package.json",
    description: "Dependency version changes across a major upgrade",
    format: "json",
    left: JSON.stringify(
      {
        name: "my-app",
        version: "1.2.0",
        dependencies: {
          react: "^18.2.0",
          next: "14.1.0",
          typescript: "^5.3.0",
          tailwindcss: "^3.4.0",
          zod: "^3.22.0",
        },
        devDependencies: {
          eslint: "^8.56.0",
          prettier: "^3.2.0",
          vitest: "^1.2.0",
        },
      },
      null,
      2,
    ),
    right: JSON.stringify(
      {
        name: "my-app",
        version: "2.0.0",
        dependencies: {
          react: "^19.0.0",
          next: "16.1.0",
          typescript: "^5.7.0",
          tailwindcss: "^4.0.0",
        },
        devDependencies: {
          eslint: "^9.0.0",
          prettier: "^3.5.0",
          vitest: "^2.0.0",
          playwright: "^1.48.0",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "k8s-deployment",
    label: "K8s Deployment",
    description: "Kubernetes deployment YAML with scaling and image changes",
    format: "yaml",
    left: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
    env: staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    spec:
      containers:
        - name: web
          image: myapp:1.2.0
          ports:
            - containerPort: 3000
          resources:
            limits:
              memory: "256Mi"
              cpu: "250m"
          env:
            - name: NODE_ENV
              value: "staging"
            - name: LOG_LEVEL
              value: "debug"`,
    right: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
    env: production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: web
  template:
    spec:
      containers:
        - name: web
          image: myapp:2.0.0
          ports:
            - containerPort: 3000
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
          env:
            - name: NODE_ENV
              value: "production"
            - name: LOG_LEVEL
              value: "warn"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000`,
  },
  {
    id: "cargo-toml",
    label: "Cargo.toml",
    description: "Rust project config with dependency version bumps",
    format: "toml",
    left: `[package]
name = "my-cli"
version = "0.3.0"
edition = "2021"
authors = ["dev@example.com"]

[dependencies]
clap = { version = "4.4", features = ["derive"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.34", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.0"`,
    right: `[package]
name = "my-cli"
version = "1.0.0"
edition = "2024"
authors = ["dev@example.com"]
license = "MIT"

[dependencies]
clap = { version = "4.5", features = ["derive", "env"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.40", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }
tracing = "0.1"

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.1"
insta = "1.34"`,
  },
  {
    id: "ts-refactor",
    label: "TypeScript Refactor",
    description: "Function refactored from callbacks to async/await",
    format: "typescript",
    left: `import { db } from "./database";

interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number, callback: (err: Error | null, user?: User) => void) {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    if (rows.length === 0) {
      callback(new Error("User not found"));
      return;
    }
    callback(null, rows[0] as User);
  });
}

function updateUser(
  id: number,
  data: Partial<User>,
  callback: (err: Error | null) => void,
) {
  getUser(id, (err, user) => {
    if (err) {
      callback(err);
      return;
    }
    const updated = { ...user, ...data };
    db.query("UPDATE users SET ? WHERE id = ?", [updated, id], callback);
  });
}

export { getUser, updateUser };`,
    right: `import { db } from "./database";

interface User {
  id: number;
  name: string;
  email: string;
  updatedAt: Date;
}

async function getUser(id: number): Promise<User> {
  const rows = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  if (rows.length === 0) {
    throw new Error(\`User \${id} not found\`);
  }
  return rows[0] as User;
}

async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const user = await getUser(id);
  const updated = { ...user, ...data, updatedAt: new Date() };
  await db.query("UPDATE users SET ? WHERE id = ?", [updated, id]);
  return updated;
}

export { getUser, updateUser };`,
  },
  {
    id: "readme-update",
    label: "README Changes",
    description: "Project README with new sections and updated instructions",
    format: "markdown",
    left: `# My Project

A simple utility for processing data files.

## Installation

\`\`\`bash
npm install my-project
\`\`\`

## Usage

\`\`\`js
import { process } from "my-project";
process("input.csv");
\`\`\`

## License

MIT`,
    right: `# My Project

A powerful utility for processing and transforming data files.

## Installation

\`\`\`bash
npm install my-project
# or
bun add my-project
\`\`\`

## Quick Start

\`\`\`js
import { process, transform } from "my-project";

const result = await process("input.csv", {
  format: "json",
  validate: true,
});

await transform(result, "output.json");
\`\`\`

## Configuration

Create a \`my-project.config.ts\` file in your project root:

\`\`\`ts
export default {
  inputDir: "./data",
  outputDir: "./dist",
  formats: ["csv", "json", "parquet"],
};
\`\`\`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT`,
  },
  {
    id: "kotlin-data-class",
    label: "Kotlin Data Class",
    description: "Data class evolution with new fields and methods",
    format: "kotlin",
    left: `package com.example.model

data class User(
    val id: Long,
    val name: String,
    val email: String,
    val role: String = "user",
) {
    fun displayName(): String = name

    fun isAdmin(): Boolean = role == "admin"
}`,
    right: `package com.example.model

import java.time.Instant

data class User(
    val id: Long,
    val name: String,
    val email: String,
    val role: Role = Role.USER,
    val avatarUrl: String? = null,
    val createdAt: Instant = Instant.now(),
) {
    enum class Role { USER, ADMIN, MODERATOR }

    fun displayName(): String = avatarUrl?.let { "$name" } ?: name

    fun hasPermission(permission: String): Boolean = when (role) {
        Role.ADMIN -> true
        Role.MODERATOR -> permission in listOf("edit", "delete")
        Role.USER -> permission == "read"
    }
}`,
  },
  {
    id: "swift-struct",
    label: "Swift Struct",
    description: "Struct refactored with Codable and computed properties",
    format: "swift",
    left: `struct Config {
    let apiUrl: String
    let timeout: Int
    let retries: Int
    let debug: Bool

    init(apiUrl: String, timeout: Int = 30, retries: Int = 3, debug: Bool = false) {
        self.apiUrl = apiUrl
        self.timeout = timeout
        self.retries = retries
        self.debug = debug
    }

    func baseHeaders() -> [String: String] {
        return [
            "Content-Type": "application/json",
            "Accept": "application/json",
        ]
    }
}`,
    right: `import Foundation

struct Config: Codable, Sendable {
    let apiUrl: URL
    let timeout: TimeInterval
    let retries: Int
    let debug: Bool
    let apiKey: String?

    var isProduction: Bool {
        !apiUrl.absoluteString.contains("staging")
    }

    init(apiUrl: URL, timeout: TimeInterval = 30, retries: Int = 3, debug: Bool = false, apiKey: String? = nil) {
        self.apiUrl = apiUrl
        self.timeout = timeout
        self.retries = retries
        self.debug = debug
        self.apiKey = apiKey
    }

    func baseHeaders() -> [String: String] {
        var headers = [
            "Content-Type": "application/json",
            "Accept": "application/json",
        ]
        if let key = apiKey {
            headers["Authorization"] = "Bearer \\(key)"
        }
        return headers
    }
}`,
  },
  {
    id: "plain-text",
    label: "Plain Text",
    description: "Two paragraphs with wording changes",
    format: "text",
    left: `The quick brown fox jumps over the lazy dog.
This sentence contains every letter of the alphabet.
It is commonly used for testing fonts and keyboards.
The original version dates back to the late 1800s.
Many variations of this phrase exist today.`,
    right: `The quick brown fox leaps over the sleepy dog.
This famous sentence contains every letter of the English alphabet.
It is widely used for testing fonts, keyboards, and text rendering.
The original version dates back to the late 1800s.
Numerous variations and adaptations of this phrase exist today.
It remains one of the most well-known pangrams in the world.`,
  },
];
