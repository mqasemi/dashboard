# core

Singleton, app-wide concerns only: HTTP interceptors, startup initialisers, guards, and services
that must have exactly one instance (auth, i18n, app configuration).

Anything reusable but not singleton — components, pipes, directives — belongs in `shared` instead.
