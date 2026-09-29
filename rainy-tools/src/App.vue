<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <h1>rainy-tools</h1>
    <div class="wrapper">

      <nav>
        <div class="nav-group">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/interval-practice">Interval Practice</RouterLink>
        </div>
        <div class="nav-group">
          <span class="nav-label">Intervallen</span>
          <RouterLink to="/intervallen/intervalsprongen">Intervalsprongen</RouterLink>
          <RouterLink to="/intervallen/intervalstappen">Intervalstappen</RouterLink>
          <RouterLink to="/intervallen/notenstappen">Notenstappen</RouterLink>
        </div>
        <div class="nav-group">
          <span class="nav-label">Sleutels</span>
          <RouterLink to="/sleutels/voortekens">Voortekens</RouterLink>
          <RouterLink to="/sleutels/grote-kleine-sleutel">Grote/kleine sleutel</RouterLink>
          <RouterLink to="/sleutels/hoofddrieklanken">Hoofddrieklanken</RouterLink>
        </div>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>

header {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers items horizontally */
  justify-content: center; /* Centers items vertically */
  text-align: center;
  width: 100%; /* Ensure it spans the full width */
  padding: 1rem 0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.nav-group {
  display: block;
}

.nav-label {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.65;
  cursor: default;
}

@media (min-width: 1024px) {
  
  h1{
    font-size: small;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
