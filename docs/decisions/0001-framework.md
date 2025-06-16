# Which Framework should we use for the Web Application?

---

**Last Update:** 2025-06-16

---

## Context and Problem Statement

We want to use a framework to make building our web application easier. Nowadays, there are a lot of popular frameworks available. We have already decided that we want to use a full-stack framework, so the next step is to decide which one we want to use.

## Considered Options

* [Next.js](https://nextjs.org/)
* [Nuxt](https://nuxt.com/)
* [Laravel](https://laravel.com/)

## Decision Outcome

Chosen option: **"Nuxt"**, because

* I already have tons of experience with Vue.js and Nuxt, so I don't have to learn any basics and can focus on project specific tasks.
* Nuxt has a simpler syntax compared to Next.js, which makes it easier to understand if unfamiliar with any of these frameworks.
* Laravel is heavily focused on the backend, which is not needed in the current scope of the project. While it can be used as a full-stack framework with tools like Inertia.js or Livewire, it is primarily a backend framework and does not provide the same level of frontend integration as Next.js or Nuxt.

## Pros and Cons of the Options

### Next.js

#### Pros

* **Popularity**: Next.js is easily the most popular full-stack framework out there, which means it has a large community and a lot of resources available.
* **Easy Hosting**: As it is so popular, most hosting platforms like Vercel, Netlify and others have built-in support for Next.js or at least guides specific to it, making it easy to deploy and host.
* **Built-in API routes**: Makes adding a backend seamless
* **SSG + SSR + ISR**: Combines multiple rendering modes for flexible performance tuning
* **First class TS support**: Strong tooling and type safety with TypeScript

#### Cons

* **Boilerplate**: React syntax is more complex than other alternatives, leading to more boilerplate code.

### Nuxt

#### Pros

* **Simple Syntax**: Nuxt uses Vue.js, which has a simpler syntax compared to React, making it easier to learn and use.
* **Auto imports**: Nuxt automatically imports things like components, composables and plugins, which reduces boilerplate code and makes development easier and faster.
* **TS support**: Nuxt has good TypeScript support, which is important for type safety and tooling.

#### Cons

* **Less Popular**: Nuxt is less popular than Next.js, which means it has a smaller community and fewer resources available.

### Laravel

#### Pros

* **Mature Ecosystem**: Laravel has a mature ecosystem with a lot of built-in features and packages, making it easy to build complex applications.
* **Strong Backend Focus**: Laravel is primarily a backend framework, which means it has a lot of features for building APIs and handling server-side logic.

#### Cons

* **Not a "full" Full-Stack Framework**: While Laravel can be used as a full-stack framework with tools like Inertia.js or Livewire, it is primarily a backend framework and does not provide the same level of frontend integration as Next.js or Nuxt.
* **Complexity**: Laravel can be more complex to set up and use compared to Next.js or Nuxt, especially for frontend development.
