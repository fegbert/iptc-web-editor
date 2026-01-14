# Use a FullStack or a Frontend Framework?

---

**Last Update:** 2025-06-16

---

## Context and Problem Statement

We want to use a framework to build our web application. The first step on deciding which framework to use is to decide whether we want to use a full-stack framework like "[NextJS](https://nextjs.org/)", or a frontend framework like "[React](https://react.dev/)"
Do we need a full-stack framework for the app, or is a frontend enough?

## Considered Options

* FullStack Framework
* Frontend Framework

## Decision Outcome

Chosen option: **"Fullstack Framework"**, because

* The project will likely be extended in the future to also include functionalities like a backend, database and authentication, which are easier to integrate into a full-stack framework.
* I already have experience with both FullStack and Frontend frameworks, so the learning curve is not a major concern.

## Pros and Cons of the Options

### FullStack Framework

#### Pros

* **Future-proof**: Using a full-stack framework like NextJS allows for easier integration of a backend, database, and/or authentication in the future.
* **End-to-end architecture**: A full-stack framework provides a complete solution for building web applications, including both frontend and backend, which can lead to better performance and easier maintenance.
* **Built-in routing and data fetching**: Simplifies interaction between frontend and backend
* **SEO optimization**: Full-stack frameworks often provide built-in server-side rendering, which can improve SEO and performance.

#### Cons

* **Complexity**: Require more setup and configuration, which can lead to a steeper learning curve and more complexity in the initial stages of development.
* **Heavier**: The build and deployment process can be more complex and require more resources, which can lead to longer build times and more complex deployment processes.
* **Learing curve**: As it is more complex, the learning curve is obviously steeper, which can lead to longer development times and more potential for bugs and issues.
* **More opinionated**: As the stack is already defined, there is less flexibility in choosing technologies and tools, which can lead to more limitations and potential issues down the line.

### Frontend Framework

#### Pros

* **Simplycity**: As the project in its current scope only requires a frontend, using a frontend framework like React is simpler and more straightforward.
* **Flexibility**: A frontend framework allows for more flexibility in choosing backend technologies later on, as it does not tie the project to a specific full-stack solution.
* **Faster initial setup**: Setting up a frontend framework is generally quicker and easier than setting up a full-stack framework, which often requires more configuration and boilerplate code.
* **Lightweight deployment**: A frontend only application can be deployed as a static SPA, which can be easily deployed using services like GitHub Pages or Vercel without the need for a backend server.

#### Cons

* **No built in routing optimization**: A frontend framework does not provide built-in routing optimization, which can lead to slower page loads and less efficient navigation.
* **No built in server-side rendering**: A frontend framework does not provide built-in server-side rendering, which can lead to slower initial page loads and less efficient SEO.
* **Seperate backend integration**: Adding a backend later requires additional work to integrate the frontend with the backend, which can lead to more complexity and potential issues down the line.
