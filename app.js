// API Documentation: https://pokeapi.co/docs/v2
let searchHistory = [];

document.getElementById("fetchPokemon").addEventListener("click", () => {
  const pokemonName = document.getElementById("pokemonName").value.toLowerCase();
  if (!pokemonName) {
    alert("Please enter a Pokémon name or ID!");
    return;
  }

  fetchPokemon(pokemonName);
});

document.getElementById("randomPokemon").addEventListener("click", () => {
  const randomId = Math.floor(Math.random() * 1010) + 1;
  document.getElementById("pokemonName").value = randomId;
  fetchPokemon(randomId);
});

function fetchPokemon(pokemonName) {
  toggleSpinner(true);
  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Pokémon not found!");
      }
      return response.json();
    })
    .then(data => {
      displayPokemonInfo(data);
      updateSearchHistory(pokemonName);
      renderStatsChart(data.stats);
      fetchEvolutionChain(data.id);
      fetchPokemonHabitat(data.id);
    })
    .catch(error => {
      document.getElementById("pokemonInfo").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    })
    .finally(() => {
      toggleSpinner(false);
    });
}

function displayPokemonInfo(data) {
  const pokemonDetails = `
    <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
    <img src="${data.sprites.front_default}" alt="${data.name}">
    <p><strong>ID:</strong> ${data.id}</p>
  `;
  document.getElementById("pokemonInfo").innerHTML = pokemonDetails;

  displayPokemonSprites(data.sprites);
  displayPokemonTypes(data.types);
  displayBaseExperience(data.base_experience);
}

function displayPokemonSprites(sprites) {
  const spriteUrls = [
    sprites.front_default,
    sprites.back_default,
    sprites.front_shiny,
    sprites.back_shiny,
  ];

  const spriteCarousel = spriteUrls
    .filter(url => url)
    .map(url => `<img src="${url}" alt="Sprite" class="sprite-img">`)
    .join("");

  document.getElementById("pokemonInfo").innerHTML += `
    <div class="sprite-carousel">
      ${spriteCarousel}
    </div>
  `;
}

function displayPokemonTypes(types) {
  const typeColors = {
    grass: "#78C850",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    psychic: "#F85888",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    fairy: "#EE99AC",
    normal: "#A8A878",
    fighting: "#C03028",
    flying: "#A890F0",
    poison: "#A040A0",
    ground: "#E0C068",
    rock: "#B8A038",
    bug: "#A8B820",
    ghost: "#705898",
    steel: "#B8B8D0",
  };

  const badges = types
    .map(type => `<span class="type-badge" style="background-color: ${typeColors[type.type.name] || '#333'};">${type.type.name}</span>`)
    .join(" ");

  document.getElementById("pokemonInfo").innerHTML += `
    <p><strong>Type(s):</strong> ${badges}</p>
  `;
}

function displayBaseExperience(baseExperience) {
  document.getElementById("pokemonInfo").innerHTML += `
    <div class="experience-bar-container">
      <p><strong>Base Experience:</strong></p>
      <div class="experience-bar">
        <div class="experience-fill" style="width: ${Math.min(baseExperience / 2, 100)}%;"></div>
      </div>
    </div>
  `;
}

function fetchEvolutionChain(pokemonId) {
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;

  fetch(speciesUrl)
    .then(response => response.json())
    .then(speciesData => fetch(speciesData.evolution_chain.url))
    .then(response => response.json())
    .then(evolutionData => {
      const chain = [];
      let current = evolutionData.chain;

      while (current) {
        chain.push(current.species.name);
        current = current.evolves_to[0];
      }

      document.getElementById("pokemonInfo").innerHTML += `
        <p><strong>Evolution Chain:</strong> ${chain.map(p => `<span>${p}</span>`).join(" → ")}</p>
      `;
    })
    .catch(error => console.error("Error fetching evolution chain:", error));
}

function fetchPokemonHabitat(pokemonId) {
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;

  fetch(speciesUrl)
    .then(response => response.json())
    .then(data => {
      const habitat = data.habitat ? data.habitat.name : "Unknown";
      document.getElementById("pokemonInfo").innerHTML += `
        <p><strong>Habitat:</strong> ${habitat}</p>
      `;
    })
    .catch(error => console.error("Error fetching habitat:", error));
}

function renderStatsChart(stats) {
  const ctx = document.getElementById("statsChart").getContext("2d");

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: stats.map(s => s.stat.name),
      datasets: [{
        label: "Stats",
        data: stats.map(s => s.base_stat),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: "#ffffff" } },
        y: { ticks: { color: "#ffffff" } },
      },
    },
  });
}

function toggleSpinner(show) {
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = show ? "block" : "none";
}

function updateSearchHistory(pokemonName) {
  if (!searchHistory.includes(pokemonName)) {
    searchHistory.push(pokemonName);
    if (searchHistory.length > 5) searchHistory.shift();
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  const historyContainer = document.getElementById("searchHistory");
  historyContainer.innerHTML = searchHistory
    .map(name => `<button class="history-item">${name}</button>`)
    .join("");
  document.querySelectorAll(".history-item").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("pokemonName").value = button.textContent;
      document.getElementById("fetchPokemon").click();
    });
  });
}
