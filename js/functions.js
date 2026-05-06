const ingredients_input = document.querySelector("#ingredients_input")
const get_button = document.querySelector('button[name="get_button"]')
const missing_ingredients = document.querySelector("#missing_ingredients")
const status_sign = document.querySelector("#status")
const container = document.querySelector("#recipe_cards")
const recipe_list = document.querySelector(".recipe_list")
const apiKey = CONFIG.API_KEY

const basicIngredients = ["water", "salt", "pepper", "oil", "sugar"]
//Assumed to be found in most kitchens. Simplies fetch a bit, since otherwise many recipies would be filtered out if user doesnt give these as input 

const url = "https://www.themealdb.com/api/json/v1/" + apiKey + "/"

console.log("Is Axios loaded?", typeof axios !== 'undefined');

get_button.addEventListener("click", () => {
    const button_select = document.querySelector('input[name="limiter"]:checked')
    const selected = button_select.value
    const limit = parseInt(missing_ingredients.value)
    const ingredients = filterIngredientsInput()
    switch (selected) {
        case "any":
            console.log("any")
            getRecipe(ingredients,-1)
            break
        case "limited":
            console.log("limited " + limit)
            getRecipe(ingredients, limit)
            break
        case "random":
            console.log("random")
            getRecipe([], -1)
            break
        default:
            console.log("error")
            break
    }
})

ingredients_input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        get_button.click()
    }
})

const getRecipe = async (ingredients, limit) => {
    status_sign.hidden = false
    recipe_list.hidden = true
    container.innerHTML = ""

    const filter_url = url + "filter.php?i="
    const lookup_url = url + "lookup.php?i="
    const random_url = url + "random.php"
    let chosenMeals = []

    try {
        //If no ingredien given or random chosen, returns 6 random meals
        if (ingredients.length === 0) {
            const randomFetches = Array.from({ length:6 }, () => axios.get(random_url))
            const randomResponse = await Promise.all(randomFetches)
            chosenMeals = randomResponse.map(res => res.data.meals[0])
            console.log("Random meals fetched")
        }
        else {
            const response = await axios.get(filter_url + ingredients[0])
            const meals_all = response.data.meals
            if (!meals_all) {
                console.log("No recipe found for s" + ingredients[0])
                status_sign.hidden = true
                recipe_list.hidden = false
                container.innerHTML = "<p>No results for those ingredients.</p>"
                return
            }
            const filterRequest = meals_all.map(meal => axios.get(lookup_url + meal.idMeal))
            console.log("Fetching details for " + meals_all.length + " recipies")
            const filterResponse = await Promise.all(filterRequest)
            const filterMeals = filterResponse.map(res => res.data.meals[0])

            const filteredMatches = filterMeals.filter(meal => {
                const recipeIngredients = []
                for (let i=1; i <= 20; i++) {    //In recipies ingredients numbered from 1 to 20
                    const ingredient = meal[`strIngredient${i}`]
                    if (ingredient && ingredient.trim() !== "") {
                        recipeIngredients.push(ingredient.toLowerCase())
                    }
                }

                let hasInputIngredients = true
                for (const inputIng of ingredients) {
                    let ingredientFound = false
                    for (const recipeIng of recipeIngredients) {
                        if (recipeIng.includes(inputIng)) {
                            ingredientFound = true
                            break
                        }
                    }
                    if (!ingredientFound) {
                        hasInputIngredients = false
                        break
                    }
                }

                if (!hasInputIngredients) return false
                
                if (limit !== -1) {
                    const kitchenIngredients = [...ingredients, ...basicIngredients]
                    const extras = []

                    for (const recipeIng of recipeIngredients) {
                        let ingredientInKitchen = false
                        for (const kitchenIng of kitchenIngredients) {
                            if (recipeIng.includes(kitchenIng)) {
                                ingredientInKitchen = true
                                break
                            }
                        }
                        if (!ingredientInKitchen) {
                            extras.push(recipeIng)
                        }
                    }

                   return extras.length <= limit
                }
                return true
            })
            chosenMeals = limitToSix(filteredMatches)
        }
        console.log("Final matches: ", chosenMeals)
        status_sign.hidden = true
        recipe_list.hidden = false
        updateMealCards(chosenMeals)

    } catch (error) {
        console.log("API error")
        status_sign.hidden = true
        recipe_list.hidden = false
        container.innerHTML = "<p>Something went wrong. Please try again.</p>"
    }        
}

const getRandomIntNumberInRange = (min,max) => {
    return Math.floor(Math.random() * max) + min;
}

const limitToSix = (meals_all) => {
    if (meals_all.length <= 6) {
        return meals_all
    }
    else {
        const filtered_list = []
        const meal_names = new Set()
        while (filtered_list.length < 6) {
            const randomized_number = getRandomIntNumberInRange(0,meals_all.length)
            const meal_name = meals_all[randomized_number].strMeal
            if (!meal_names.has(meal_name)) {
                meal_names.add(meal_name)
                filtered_list.push(meals_all[randomized_number])
                console.log("Added to list: " + meal_name)
            }
        }
        return filtered_list
    }
}

const filterIngredientsInput = () => {
    const ingredients = ingredients_input.value
    .split(/[,\s]+/)
    .map(item => item.trim().toLowerCase())
    .filter(item => item !== "")
    return ingredients
}


const updateMealCards = (meals_list) => {
    container.innerHTML = ""

    if (meals_list.length == 0) {
        container.innerHTML = "<p>Error: No meals found</p>"
        console.log("Error: meals_list.length = 0")
    }
    else {
        meals_list.forEach(meal => {
            const card = document.createElement("meal-card")
            const ingredientList = []
            for (let i=1; i<20; i++) {   //Ingredients start at 1 and 20 is maximum
                const ingredient = meal[`strIngredient${i}`]
                if (ingredient && ingredient.trim() !== "") ingredientList.push(ingredient)
            }

            card.setAttribute("title", meal.strMeal)
            card.setAttribute("image", meal.strMealThumb)
            card.setAttribute("ingredients", ingredientList.join(", "))
            card.setAttribute("recipe", meal.strInstructions)
            container.appendChild(card)
        })
    }
}