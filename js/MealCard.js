class MealCard extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})
    }

    connectedCallback() {
        const title = this.getAttribute("title") ?? "Unknown"
        const meal_ingredients = this.getAttribute("ingredients") ?? "No ingredients"
        const image = this.getAttribute("image") ?? "./images/Image-not-found.png"
        const recipe = this.getAttribute("recipe") ?? "Recipe not found"

        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./css/meal-card.css">
        <div class="card_container">
            <h3>${title}</h3>
            <img class="image" src="${image}" alt="${title}"/>
            <p>${meal_ingredients}</p>
            <button type="button" id="toggle_recipe">Show recipe</button>
            <p id="recipe_text" hidden>${recipe}</p>
        </div>
        `

        this.shadowRoot.querySelector("#toggle_recipe").addEventListener("click", () => this.toggleRecipe())
    }

    toggleRecipe() {
        const recipeText = this.shadowRoot.querySelector("#recipe_text")
        const button = this.shadowRoot.querySelector("#toggle_recipe")

        recipeText.hidden = !recipeText.hidden
        button.innerHTML = recipeText.hidden ? "Show recipe" : "Hide recipe"
    }
}

customElements.define("meal-card", MealCard)