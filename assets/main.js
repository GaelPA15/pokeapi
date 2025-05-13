document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonId = document.getElementById('pokemon-id');
    const pokemonImg = document.getElementById('pokemon-img');
    const pokemonTypes = document.getElementById('pokemon-types');
    const pokemonHeight = document.getElementById('pokemon-height');
    const pokemonWeight = document.getElementById('pokemon-weight');
    const statsList = document.getElementById('stats-list');
    const searchInput = document.getElementById('pokemon-search');
    const searchBtn = document.getElementById('search-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    let currentPokemonId = 1;
    const totalPokemon = 898;
    
    // Cargar el Pokémon inicial
    fetchPokemon(currentPokemonId);
    
    // Event listeners
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            fetchPokemon(searchTerm);
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentPokemonId > 1) {
            currentPokemonId--;
            fetchPokemon(currentPokemonId);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPokemonId < totalPokemon) {
            currentPokemonId++;
            fetchPokemon(currentPokemonId);
        }
    });
    
    // Función para obtener datos del Pokémon
    async function fetchPokemon(identifier) {
        try {
            // Obtener datos básicos del Pokémon
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
            if (!response.ok) {
                throw new Error('Pokémon no encontrado');
            }
            const pokemonData = await response.json();
            
            // Obtener datos de la especie para la información en español
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();
            
            // Obtener información de tipos en español
            const typesData = await Promise.all(
                pokemonData.types.map(type => 
                    fetch(type.type.url).then(res => res.json())
                )
            );
            
            currentPokemonId = pokemonData.id;
            displayPokemon(pokemonData, speciesData, typesData);
        } catch (error) {
            alert(error.message);
            console.error('Error fetching Pokémon:', error);
        }
    }
    
    // Función para mostrar los datos del Pokémon
    function displayPokemon(pokemon, species, types) {
        // Nombre en español o mensaje especial para Squirtle
        let displayName;
        if (pokemon.id === 7) {
            displayName = "Squirtle (Vamo a calmarno)";
        } else {
            const spanishName = species.names.find(name => name.language.name === 'es');
            displayName = spanishName ? spanishName.name : 
                         pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        }
        pokemonName.textContent = displayName;
        
        // ID
        pokemonId.textContent = `ID: #${pokemon.id.toString().padStart(3, '0')}`;
        
        // Altura y peso (ya están en formato internacional)
        pokemonHeight.textContent = `Altura: ${(pokemon.height / 10).toFixed(1)} m`;
        pokemonWeight.textContent = `Peso: ${(pokemon.weight / 10).toFixed(1)} kg`;
        
        // Imagen
        pokemonImg.src = pokemon.sprites.other['official-artwork'].front_default || 
                         pokemon.sprites.front_default;
        pokemonImg.alt = `Imagen de ${pokemon.name}`;
        
        // Tipos en español
        pokemonTypes.innerHTML = 'Tipo: ';
        pokemon.types.forEach((type, index) => {
            const typeInfo = types.find(t => t.name === type.type.name);
            const typeNameEs = typeInfo.names.find(name => name.language.name === 'es');
            
            const typeElement = document.createElement('span');
            typeElement.textContent = typeNameEs ? typeNameEs.name : 
                                    type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);
            typeElement.classList.add(`type-${type.type.name}`);
            
            if (index > 0) {
                pokemonTypes.appendChild(document.createTextNode(', '));
            }
            pokemonTypes.appendChild(typeElement);
        });
        
        // Estadísticas (traducimos los nombres)
        statsList.innerHTML = '';
        pokemon.stats.forEach(stat => {
            const li = document.createElement('li');
            const statName = document.createElement('span');
            
            // Traducción simple de los nombres de estadísticas
            const statTranslations = {
                'hp': 'PS',
                'attack': 'Ataque',
                'defense': 'Defensa',
                'special-attack': 'Ataque Especial',
                'special-defense': 'Defensa Especial',
                'speed': 'Velocidad'
            };
            
            const statNameEs = statTranslations[stat.stat.name] || 
                             stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1).replace('-', ' ');
            
            statName.textContent = `${statNameEs}: `;
            
            const statValue = document.createElement('span');
            statValue.textContent = stat.base_stat;
            
            li.appendChild(statName);
            li.appendChild(statValue);
            statsList.appendChild(li);
        });
        
        // Actualizar estado de los botones de navegación
        prevBtn.disabled = currentPokemonId <= 1;
        nextBtn.disabled = currentPokemonId >= totalPokemon;
        
        // Limpiar el campo de búsqueda
        searchInput.value = '';
    }
});